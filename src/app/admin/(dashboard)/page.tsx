"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { normalizeIndianMobile, openWhatsAppConfirmation } from "@/lib/utils";
import { APPOINTMENT_STATUSES, type Appointment, type AppointmentStatus } from "@/types/admin";
import AppointmentsTable from "./AppointmentsTable";
import ConfirmAppointmentModal from "./ConfirmAppointmentModal";
import DeleteConfirmDialog from "./DeleteConfirmDialog";
import ArchiveConfirmDialog from "./ArchiveConfirmDialog";
import BinModal from "./BinModal";
import ArchivedAppointmentDetailsModal from "./ArchivedAppointmentDetailsModal";
import NewAppointmentModal, { type NewAppointmentValues } from "./NewAppointmentModal";
import TodaysAppointments from "./TodaysAppointments";
import AppointmentDetailsModal from "./AppointmentDetailsModal";
import { formatDate, formatTime } from "./appointmentDisplay";
import {
  DATE_FILTER_OPTIONS,
  getLocalISODate,
  matchesDateFilter,
  type DateFilterMode,
} from "./dateFilterUtils";

type LoadState = "loading" | "loaded" | "error";

const LOAD_ERROR_MESSAGE =
  "We couldn't load appointments right now. Please check your connection and try again.";
const ACTION_ERROR_MESSAGE = "That didn't go through. Please try again.";

export default function AdminDashboardPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loadState, setLoadState] = useState<LoadState>("loading");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | AppointmentStatus>("all");
  const [dateFilterMode, setDateFilterMode] = useState<DateFilterMode>("all");
  const [customDate, setCustomDate] = useState("");

  const [busyId, setBusyId] = useState<string | null>(null);
  const [pendingArchive, setPendingArchive] = useState<Appointment | null>(null);
  const [pendingPermanentDelete, setPendingPermanentDelete] = useState<Appointment | null>(null);
  const [viewingAppointmentId, setViewingAppointmentId] = useState<string | null>(null);
  const [viewingArchivedId, setViewingArchivedId] = useState<string | null>(null);
  const [isBinOpen, setIsBinOpen] = useState(false);
  const [isNewAppointmentOpen, setIsNewAppointmentOpen] = useState(false);
  const [isCreatingAppointment, setIsCreatingAppointment] = useState(false);
  const [banner, setBanner] = useState<{ type: "success" | "error"; message: string } | null>(
    null,
  );

  const [editingTreatmentId, setEditingTreatmentId] = useState<string | null>(null);
  const [treatmentDraft, setTreatmentDraft] = useState("");

  // Two-step "Confirmed" status workflow. Selecting "Confirmed" never
  // updates the row directly — it opens this review-then-schedule modal,
  // and only the modal's own "Confirm Appointment" action writes to the DB.
  const [confirmingAppointment, setConfirmingAppointment] = useState<Appointment | null>(null);

  async function fetchAppointments() {
    setLoadState("loading");
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("appointments")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        setLoadState("error");
        return;
      }

      setAppointments((data ?? []) as Appointment[]);
      setLoadState("loaded");
    } catch {
      setLoadState("error");
    }
  }

  useEffect(() => {
    fetchAppointments();
  }, []);

  useEffect(() => {
    if (!banner) return;
    const timer = setTimeout(() => setBanner(null), 4000);
    return () => clearTimeout(timer);
  }, [banner]);

  // Archived appointments (Recently Deleted / Bin) must never count toward
  // the normal list, its summary cards, or any date/status/search filter —
  // so every derived value below is computed from `activeAppointments`,
  // never from the raw `appointments` state directly.
  const activeAppointments = useMemo(
    () => appointments.filter((appointment) => !appointment.archived_at),
    [appointments],
  );

  const archivedAppointments = useMemo(
    () =>
      appointments
        .filter((appointment) => Boolean(appointment.archived_at))
        .sort((a, b) => (b.archived_at ?? "").localeCompare(a.archived_at ?? "")),
    [appointments],
  );

  const statusCounts = useMemo(() => {
    const counts: Record<AppointmentStatus, number> = {
      pending: 0,
      confirmed: 0,
      completed: 0,
      cancelled: 0,
    };
    for (const appointment of activeAppointments) {
      counts[appointment.status] = (counts[appointment.status] ?? 0) + 1;
    }
    return counts;
  }, [activeAppointments]);

  const summaryCards: Array<{
    key: "all" | AppointmentStatus;
    label: string;
    count: number;
    activeClasses: string;
  }> = [
    {
      key: "all",
      label: "Total",
      count: activeAppointments.length,
      activeClasses: "border-blue-600 bg-blue-50 text-blue-900",
    },
    {
      key: "pending",
      label: "Pending",
      count: statusCounts.pending,
      activeClasses: "border-gold-500 bg-gold-100 text-gold-600",
    },
    {
      key: "confirmed",
      label: "Confirmed",
      count: statusCounts.confirmed,
      activeClasses: "border-blue-600 bg-blue-100 text-blue-700",
    },
    {
      key: "completed",
      label: "Completed",
      count: statusCounts.completed,
      activeClasses: "border-emerald-500 bg-emerald-100 text-emerald-700",
    },
    {
      key: "cancelled",
      label: "Cancelled",
      count: statusCounts.cancelled,
      activeClasses: "border-red-400 bg-red-50 text-red-600",
    },
  ];

  const todayIso = getLocalISODate();

  const todaysAppointments = useMemo(
    () => activeAppointments.filter((appointment) => appointment.preferred_date === todayIso),
    [activeAppointments, todayIso],
  );

  const filteredAppointments = useMemo(() => {
    const query = search.trim().toLowerCase();
    return activeAppointments.filter((appointment) => {
      const matchesSearch =
        !query ||
        appointment.patient_name.toLowerCase().includes(query) ||
        appointment.phone.toLowerCase().includes(query);
      const matchesStatus = statusFilter === "all" || appointment.status === statusFilter;
      const matchesDate = matchesDateFilter(
        appointment.preferred_date,
        dateFilterMode,
        customDate,
        todayIso,
      );
      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [activeAppointments, search, statusFilter, dateFilterMode, customDate, todayIso]);

  const hasActiveFilters = Boolean(search || statusFilter !== "all" || dateFilterMode !== "all");

  const viewingAppointment = useMemo(
    () => activeAppointments.find((appointment) => appointment.id === viewingAppointmentId) ?? null,
    [activeAppointments, viewingAppointmentId],
  );

  const viewingArchivedAppointment = useMemo(
    () => archivedAppointments.find((appointment) => appointment.id === viewingArchivedId) ?? null,
    [archivedAppointments, viewingArchivedId],
  );

  async function handleStatusChange(id: string, status: AppointmentStatus) {
    const previous = appointments;
    setBusyId(id);
    setAppointments((current) =>
      current.map((appointment) =>
        appointment.id === id ? { ...appointment, status } : appointment,
      ),
    );

    try {
      const supabase = createClient();
      const { error } = await supabase.from("appointments").update({ status }).eq("id", id);

      if (error) {
        setAppointments(previous);
        setBanner({ type: "error", message: ACTION_ERROR_MESSAGE });
      } else {
        setBanner({ type: "success", message: `Status updated to "${status}".` });
      }
    } catch {
      setAppointments(previous);
      setBanner({ type: "error", message: ACTION_ERROR_MESSAGE });
    } finally {
      setBusyId(null);
    }
  }

  /**
   * Entry point passed to the table/details modal for the status <select>.
   * Every status keeps its previous immediate-update behavior, EXCEPT
   * "confirmed": that one only opens the confirmation workflow modal below,
   * and does not touch the database (or local state) by itself.
   */
  function handleStatusSelectChange(id: string, status: AppointmentStatus) {
    if (status === "confirmed") {
      const appointment = appointments.find((a) => a.id === id);
      if (appointment) setConfirmingAppointment(appointment);
      return;
    }
    handleStatusChange(id, status);
  }

  async function handleConfirmAppointment(date: string, time: string, message: string) {
    if (!confirmingAppointment) return;
    const target = confirmingAppointment;

    setBusyId(target.id);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("appointments")
        .update({ status: "confirmed", preferred_date: date, preferred_time: time })
        .eq("id", target.id);

      if (error) {
        setBanner({ type: "error", message: ACTION_ERROR_MESSAGE });
        return;
      }

      const updated: Appointment = {
        ...target,
        status: "confirmed",
        preferred_date: date,
        preferred_time: time,
      };
      setAppointments((current) =>
        current.map((appointment) => (appointment.id === target.id ? updated : appointment)),
      );
      setConfirmingAppointment(null);

      // Appointment is saved as Confirmed at this point no matter what
      // happens next — opening WhatsApp is a best-effort follow-up action,
      // never a condition for the confirmation itself. Called directly
      // here (no setTimeout) so it still runs within the same user
      // interaction as the admin's click, which is what keeps browsers
      // from treating it as a blocked popup.
      const opened = openWhatsAppConfirmation(target.phone, message);
      setBanner({
        type: opened ? "success" : "error",
        message: opened
          ? `Appointment confirmed for ${target.patient_name} on ${formatDate(date)} at ${formatTime(time)}. WhatsApp opened with the confirmation message.`
          : "Appointment confirmed, but WhatsApp could not be opened for this number. Please contact the patient manually.",
      });
    } catch {
      setBanner({ type: "error", message: ACTION_ERROR_MESSAGE });
    } finally {
      setBusyId(null);
    }
  }

  function handleEditTreatmentStart(appointment: Appointment) {
    setEditingTreatmentId(appointment.id);
    setTreatmentDraft(appointment.treatment);
  }

  function handleEditTreatmentCancel() {
    setEditingTreatmentId(null);
    setTreatmentDraft("");
  }

  async function handleEditTreatmentSave(id: string) {
    const nextTreatment = treatmentDraft.trim();
    if (!nextTreatment) {
      setBanner({ type: "error", message: "Please choose a treatment before saving." });
      return;
    }

    setBusyId(id);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("appointments")
        .update({ treatment: nextTreatment })
        .eq("id", id);

      if (error) {
        setBanner({ type: "error", message: ACTION_ERROR_MESSAGE });
        return;
      }

      setAppointments((current) =>
        current.map((appointment) =>
          appointment.id === id ? { ...appointment, treatment: nextTreatment } : appointment,
        ),
      );
      setBanner({ type: "success", message: "Treatment updated." });
      setEditingTreatmentId(null);
      setTreatmentDraft("");
    } catch {
      setBanner({ type: "error", message: ACTION_ERROR_MESSAGE });
    } finally {
      setBusyId(null);
    }
  }

  /**
   * Archive (soft delete). Sets archived_at only — status, dates, and every
   * other field on the row are untouched, so a Restore afterward puts the
   * appointment back exactly as it was.
   *
   * IMPORTANT: this deliberately chains `.select().single()` onto the
   * update, not just `.update(...).eq(...)`. With Supabase, an update whose
   * WHERE clause matches zero rows (e.g. blocked by an RLS policy, or the id
   * no longer exists) returns `error: null` and succeeds silently — there is
   * no way to tell "0 rows updated" from "1 row updated" without asking for
   * the row back. `.select().single()` forces exactly that: if the row
   * actually changed in the database we get it back in `data`; if it didn't
   * (RLS denied it, wrong id, etc.), `.single()` itself errors out because
   * zero rows were returned, so we can no longer report false success while
   * the database is left untouched.
   */
  async function handleArchiveConfirmed() {
    if (!pendingArchive) return;
    const target = pendingArchive;
    setBusyId(target.id);

    try {
      const supabase = createClient();
      const archivedAt = new Date().toISOString();
      const { data, error } = await supabase
        .from("appointments")
        .update({ archived_at: archivedAt })
        .eq("id", target.id)
        .select()
        .single();

      if (error || !data) {
        // Always log the real Supabase error — never swallow it. Common
        // causes: the `archived_at` column doesn't exist yet on this
        // Supabase project (the admin_archive_and_manual_appointments.sql
        // migration hasn't been run), or the admin's session isn't passing
        // the is_admin() RLS check on the UPDATE policy.
        console.error("[handleArchiveConfirmed] Failed to archive appointment", {
          appointmentId: target.id,
          error,
        });
        setBanner({
          type: "error",
          message: error
            ? `Couldn't move to Recently Deleted: ${error.message}`
            : "Couldn't move to Recently Deleted: the update didn't match any row (check RLS/permissions).",
        });
        return;
      }

      const updated = data as Appointment;
      setAppointments((current) =>
        current.map((appointment) => (appointment.id === target.id ? updated : appointment)),
      );
      setBanner({
        type: "success",
        message: `Moved appointment for ${target.patient_name} to Recently Deleted.`,
      });
    } catch (err) {
      console.error("[handleArchiveConfirmed] Unexpected error", err);
      setBanner({ type: "error", message: ACTION_ERROR_MESSAGE });
    } finally {
      setBusyId(null);
      setPendingArchive(null);
    }
  }

  /**
   * Restore from the bin. Clears archived_at only — preserves status,
   * preferred date/time, and every other field exactly as archived.
   */
  async function handleRestore(appointment: Appointment) {
    setBusyId(appointment.id);

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("appointments")
        .update({ archived_at: null })
        .eq("id", appointment.id);

      if (error) {
        setBanner({ type: "error", message: ACTION_ERROR_MESSAGE });
      } else {
        setAppointments((current) =>
          current.map((item) =>
            item.id === appointment.id ? { ...item, archived_at: null } : item,
          ),
        );
        setBanner({
          type: "success",
          message: `Restored appointment for ${appointment.patient_name}.`,
        });
      }
    } catch {
      setBanner({ type: "error", message: ACTION_ERROR_MESSAGE });
    } finally {
      setBusyId(null);
    }
  }

  /** Permanent delete — only reachable from inside Recently Deleted / Bin. */
  async function handlePermanentDeleteConfirmed() {
    if (!pendingPermanentDelete) return;
    const target = pendingPermanentDelete;
    setBusyId(target.id);

    try {
      const supabase = createClient();
      const { error } = await supabase.from("appointments").delete().eq("id", target.id);

      if (error) {
        setBanner({ type: "error", message: ACTION_ERROR_MESSAGE });
      } else {
        setAppointments((current) => current.filter((a) => a.id !== target.id));
        setBanner({
          type: "success",
          message: `Permanently deleted appointment for ${target.patient_name}.`,
        });
      }
    } catch {
      setBanner({ type: "error", message: ACTION_ERROR_MESSAGE });
    } finally {
      setBusyId(null);
      setPendingPermanentDelete(null);
    }
  }

  /**
   * "+ New Appointment" save. Inserts straight into the existing
   * public.appointments table (no separate table, no schema bypass).
   *
   * If the admin picked "Confirmed" as the status, this deliberately does
   * NOT insert with status "confirmed" directly — that would bypass the
   * existing review-then-schedule confirmation workflow. Instead it saves
   * the new appointment as "pending" and then opens ConfirmAppointmentModal
   * (the same modal/flow used everywhere else) so the admin confirms it
   * through the normal path.
   */
  async function handleCreateAppointment(values: NewAppointmentValues) {
    setIsCreatingAppointment(true);
    try {
      const supabase = createClient();
      const insertStatus = values.status === "confirmed" ? "pending" : values.status;
      const { data, error } = await supabase
        .from("appointments")
        .insert({
          patient_name: values.patientName.trim(),
          phone: normalizeIndianMobile(values.phone) ?? values.phone.trim(),
          treatment: values.treatment,
          preferred_date: values.preferredDate,
          preferred_time: values.preferredTime,
          message: values.message.trim() || null,
          status: insertStatus,
        })
        .select()
        .single();

      if (error || !data) {
        setBanner({ type: "error", message: ACTION_ERROR_MESSAGE });
        return;
      }

      const created = data as Appointment;
      setAppointments((current) => [created, ...current]);
      setIsNewAppointmentOpen(false);
      setBanner({ type: "success", message: `Appointment created for ${created.patient_name}.` });

      if (values.status === "confirmed") {
        setConfirmingAppointment(created);
      }
    } catch {
      setBanner({ type: "error", message: ACTION_ERROR_MESSAGE });
    } finally {
      setIsCreatingAppointment(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h1 className="font-display text-2xl text-ink">Appointments</h1>
          <p className="text-sm text-ink/60">
            Manage appointment requests submitted from the website.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsBinOpen(true)}
          className="inline-flex items-center justify-center gap-1.5 rounded-full border border-line px-4 py-2 text-sm font-medium text-ink transition-colors hover:bg-canvas-soft"
        >
          🗑️ Recently Deleted
          {archivedAppointments.length > 0 ? (
            <span className="ml-1 inline-flex items-center justify-center rounded-full bg-canvas-soft px-2 py-0.5 text-xs font-semibold text-ink/70">
              {archivedAppointments.length}
            </span>
          ) : null}
        </button>
      </div>

      {loadState !== "loading" ? (
        <TodaysAppointments
          appointments={todaysAppointments}
          onViewRequest={(appointment) => setViewingAppointmentId(appointment.id)}
        />
      ) : null}

      <div
        role="group"
        aria-label="Appointment status summary"
        className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5"
      >
        {loadState === "loading"
          ? Array.from({ length: 5 }).map((_, index) => (
              <div
                key={index}
                className="animate-pulse rounded-card border border-line bg-canvas-soft p-4"
              >
                <div className="h-3 w-16 rounded bg-line" />
                <div className="mt-3 h-6 w-10 rounded bg-line" />
              </div>
            ))
          : summaryCards.map((card) => {
              const isActive = statusFilter === card.key;
              return (
                <button
                  key={card.key}
                  type="button"
                  onClick={() => setStatusFilter(card.key)}
                  aria-pressed={isActive}
                  className={`rounded-card border p-4 text-left transition-colors focus:outline-none focus:ring-2 focus:ring-blue-600 ${
                    isActive
                      ? card.activeClasses
                      : "border-line bg-canvas text-ink hover:bg-canvas-soft"
                  }`}
                >
                  <div className="text-xs font-medium uppercase tracking-wide text-ink/60">
                    {card.label}
                  </div>
                  <div className="mt-1 text-2xl font-semibold">{card.count}</div>
                </button>
              );
            })}
      </div>

      {banner ? (
        <div
          role="status"
          className={`rounded-lg border px-4 py-3 text-sm ${
            banner.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border-red-200 bg-red-50 text-red-600"
          }`}
        >
          {banner.message}
        </div>
      ) : null}

      <div className="flex flex-col gap-3 rounded-card border border-line bg-canvas p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by name or phone"
            className="w-full rounded-lg border border-line bg-canvas px-4 py-2.5 text-sm text-ink placeholder:text-ink/40 focus:border-blue-600 focus:outline-none sm:max-w-xs"
          />
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as "all" | AppointmentStatus)}
            className="rounded-lg border border-line bg-canvas px-4 py-2.5 text-sm text-ink focus:border-blue-600 focus:outline-none"
          >
            <option value="all">All statuses</option>
            {APPOINTMENT_STATUSES.map((status) => (
              <option key={status} value={status} className="capitalize">
                {status}
              </option>
            ))}
          </select>
          <select
            value={dateFilterMode}
            onChange={(event) => {
              const mode = event.target.value as DateFilterMode;
              setDateFilterMode(mode);
              if (mode !== "custom") setCustomDate("");
            }}
            className="rounded-lg border border-line bg-canvas px-4 py-2.5 text-sm text-ink focus:border-blue-600 focus:outline-none"
          >
            {DATE_FILTER_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {dateFilterMode === "custom" ? (
            <input
              type="date"
              value={customDate}
              onChange={(event) => setCustomDate(event.target.value)}
              className="rounded-lg border border-line bg-canvas px-4 py-2.5 text-sm text-ink focus:border-blue-600 focus:outline-none"
            />
          ) : null}
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {hasActiveFilters ? (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setStatusFilter("all");
                setDateFilterMode("all");
                setCustomDate("");
              }}
              className="text-sm font-medium text-blue-700 hover:underline"
            >
              Clear filters
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => setIsNewAppointmentOpen(true)}
            className="inline-flex items-center justify-center whitespace-nowrap rounded-full bg-blue-900 px-4 py-2.5 text-sm font-semibold text-canvas transition-colors hover:bg-blue-800"
          >
            + New Appointment
          </button>
        </div>
      </div>

      {loadState === "loading" ? (
        <div className="rounded-card border border-line bg-canvas p-10 text-center text-sm text-ink/60">
          Loading appointments…
        </div>
      ) : loadState === "error" ? (
        <div className="flex flex-col items-center gap-3 rounded-card border border-line bg-canvas p-10 text-center">
          <p className="text-sm text-red-600">{LOAD_ERROR_MESSAGE}</p>
          <button
            type="button"
            onClick={fetchAppointments}
            className="inline-flex items-center justify-center rounded-full bg-blue-900 px-5 py-2 text-sm font-semibold text-canvas transition-colors hover:bg-blue-800"
          >
            Retry
          </button>
        </div>
      ) : filteredAppointments.length === 0 ? (
        <div className="rounded-card border border-line bg-canvas p-10 text-center text-sm text-ink/60">
          {activeAppointments.length === 0
            ? "No appointment requests yet."
            : "No appointments match your search or filters."}
        </div>
      ) : (
        <AppointmentsTable
          appointments={filteredAppointments}
          busyId={busyId}
          onStatusChange={handleStatusSelectChange}
          onArchiveRequest={setPendingArchive}
          onViewRequest={(appointment) => setViewingAppointmentId(appointment.id)}
          editingTreatmentId={editingTreatmentId}
          treatmentDraft={treatmentDraft}
          onEditTreatmentStart={handleEditTreatmentStart}
          onEditTreatmentCancel={handleEditTreatmentCancel}
          onTreatmentDraftChange={setTreatmentDraft}
          onEditTreatmentSave={handleEditTreatmentSave}
        />
      )}

      {confirmingAppointment ? (
        <ConfirmAppointmentModal
          appointment={confirmingAppointment}
          isSaving={busyId === confirmingAppointment.id}
          onCancel={() => setConfirmingAppointment(null)}
          onConfirm={handleConfirmAppointment}
        />
      ) : null}

      {pendingArchive ? (
        <ArchiveConfirmDialog
          appointment={pendingArchive}
          isArchiving={busyId === pendingArchive.id}
          onCancel={() => setPendingArchive(null)}
          onConfirm={handleArchiveConfirmed}
        />
      ) : null}

      {viewingAppointment ? (
        <AppointmentDetailsModal
          appointment={viewingAppointment}
          isBusy={busyId === viewingAppointment.id}
          busyId={busyId}
          onClose={() => setViewingAppointmentId(null)}
          onStatusChange={handleStatusSelectChange}
          editingTreatmentId={editingTreatmentId}
          treatmentDraft={treatmentDraft}
          onEditTreatmentStart={handleEditTreatmentStart}
          onEditTreatmentCancel={handleEditTreatmentCancel}
          onTreatmentDraftChange={setTreatmentDraft}
          onEditTreatmentSave={handleEditTreatmentSave}
        />
      ) : null}

      {isNewAppointmentOpen ? (
        <NewAppointmentModal
          isSaving={isCreatingAppointment}
          onCancel={() => setIsNewAppointmentOpen(false)}
          onSave={handleCreateAppointment}
        />
      ) : null}

      {isBinOpen ? (
        <BinModal
          appointments={archivedAppointments}
          busyId={busyId}
          onClose={() => setIsBinOpen(false)}
          onViewRequest={(appointment) => setViewingArchivedId(appointment.id)}
          onRestoreRequest={handleRestore}
          onPermanentDeleteRequest={setPendingPermanentDelete}
        />
      ) : null}

      {viewingArchivedAppointment ? (
        <ArchivedAppointmentDetailsModal
          appointment={viewingArchivedAppointment}
          onClose={() => setViewingArchivedId(null)}
        />
      ) : null}

      {pendingPermanentDelete ? (
        <DeleteConfirmDialog
          appointment={pendingPermanentDelete}
          isDeleting={busyId === pendingPermanentDelete.id}
          onCancel={() => setPendingPermanentDelete(null)}
          onConfirm={handlePermanentDeleteConfirmed}
        />
      ) : null}
    </div>
  );
}
