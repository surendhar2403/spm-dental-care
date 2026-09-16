"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import LogoutButton from "./LogoutButton";
import { createClient } from "@/lib/supabase/client";
import { normalizeIndianMobile, openWhatsAppConfirmation } from "@/lib/utils";
import {
  ADMIN_TREATMENT_OPTIONS,
  APPOINTMENT_STATUSES,
  type AdminTreatment,
  type Appointment,
  type AppointmentStatus,
  type Doctor,
} from "@/types/admin";
import AppointmentsTable from "./AppointmentsTable";
import ConfirmAppointmentModal from "./ConfirmAppointmentModal";
import DeleteConfirmDialog from "./DeleteConfirmDialog";
import ArchiveConfirmDialog from "./ArchiveConfirmDialog";
import BinModal from "./BinModal";
import ArchivedAppointmentDetailsModal from "./ArchivedAppointmentDetailsModal";
import NewAppointmentModal, { type NewAppointmentValues } from "./NewAppointmentModal";
import ManageDoctorsModal, { type NewDoctorValues } from "./ManageDoctorsModal";
import ManageTreatmentsModal from "./ManageTreatmentsModal";
import ManageTestimonialsModal from "./ManageTestimonialsModal";
import ManageClinicInfoModal from "./ManageClinicInfoModal";
import type { AdminTestimonial } from "@/types/admin";
import type { ClinicGalleryImage, ClinicSettings } from "@/types";
import PaginationControls from "./PaginationControls";
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
const APPOINTMENTS_PAGE_SIZE = 10;

export default function AdminDashboardPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loadState, setLoadState] = useState<LoadState>("loading");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | AppointmentStatus>("all");
  const [dateFilterMode, setDateFilterMode] = useState<DateFilterMode>("all");
  const [customDate, setCustomDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

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

  // Doctors & Treatments management (Admin Dashboard requirements 1 & 2).
  // Both lists are fetched once on mount, alongside appointments, and kept
  // in their own state — entirely separate from the appointments list, so
  // nothing here can affect appointment data.
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [doctorsLoadState, setDoctorsLoadState] = useState<LoadState>("loading");
  const [doctorsLoadError, setDoctorsLoadError] = useState<string | null>(null);
  const [isDoctorsModalOpen, setIsDoctorsModalOpen] = useState(false);
  const [isSavingDoctor, setIsSavingDoctor] = useState(false);
  const [doctorBusyId, setDoctorBusyId] = useState<string | null>(null);

  const [treatments, setTreatments] = useState<AdminTreatment[]>([]);
  const [treatmentsLoadState, setTreatmentsLoadState] = useState<LoadState>("loading");
  const [treatmentsLoadError, setTreatmentsLoadError] = useState<string | null>(null);
  const [isTreatmentsModalOpen, setIsTreatmentsModalOpen] = useState(false);
  const [isSavingTreatment, setIsSavingTreatment] = useState(false);
  const [treatmentBusyId, setTreatmentBusyId] = useState<string | null>(null);

  // Testimonials (Admin-managed patient reviews)
  const [testimonials, setTestimonials] = useState<AdminTestimonial[]>([]);
  const [testimonialsLoadState, setTestimonialsLoadState] = useState<LoadState>("loading");
  const [testimonialsLoadError, setTestimonialsLoadError] = useState<string | null>(null);
  const [isTestimonialsModalOpen, setIsTestimonialsModalOpen] = useState(false);
  const [isSavingTestimonial, setIsSavingTestimonial] = useState(false);
  const [testimonialBusyId, setTestimonialBusyId] = useState<string | null>(null);

  const [clinicSettings, setClinicSettings] = useState<ClinicSettings | null>(null);
  const [clinicSettingsLoadState, setClinicSettingsLoadState] = useState<LoadState>("loading");
  const [clinicSettingsLoadError, setClinicSettingsLoadError] = useState<string | null>(null);
  const [clinicGalleryImages, setClinicGalleryImages] = useState<ClinicGalleryImage[]>([]);
  const [clinicGalleryLoadState, setClinicGalleryLoadState] = useState<LoadState>("loading");
  const [clinicGalleryLoadError, setClinicGalleryLoadError] = useState<string | null>(null);
  const [isClinicInfoModalOpen, setIsClinicInfoModalOpen] = useState(false);
  const [isSavingClinicInfo, setIsSavingClinicInfo] = useState(false);
  const [clinicInfoBusyId, setClinicInfoBusyId] = useState<string | null>(null);

  // Two-step "Confirmed" status workflow. Selecting "Confirmed" never
  // updates the row directly — it opens this review-then-schedule modal,
  // and only the modal's own "Confirm Appointment" action writes to the DB.
  const [confirmingAppointment, setConfirmingAppointment] = useState<Appointment | null>(null);

  async function fetchAppointments() {
    setLoadState("loading");
    try {
      const supabase = createClient();

      // TEMP DIAGNOSTIC — remove once doctors/treatments load is confirmed
      // fixed. Logged here too (not just doctors/treatments) so we have a
      // known-working baseline to compare against: same client creation
      // pattern, same session, different table.
      const {
        data: { session },
      } = await supabase.auth.getSession();
      // eslint-disable-next-line no-console
      console.log("[fetchAppointments] Supabase session", {
        hasSession: !!session,
        userId: session?.user?.id,
        email: session?.user?.email,
        role: session?.user?.role,
        tokenExpiresAt: session?.expires_at,
      });

      const { data, error } = await supabase
        .from("appointments")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        // eslint-disable-next-line no-console
        console.error("[fetchAppointments] Supabase error", {
          error,
          message: error?.message,
          details: error?.details,
          hint: error?.hint,
          code: error?.code,
          name: error?.name,
        });
        setLoadState("error");
        return;
      }

      setAppointments((data ?? []) as Appointment[]);
      setLoadState("loaded");
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("[fetchAppointments] Unexpected/thrown error", err);
      setLoadState("error");
    }
  }

  /**
   * Loads public.doctors. IMPORTANT: the real Supabase error is always
   * logged (never swallowed) and its message is kept in state so
   * ManageDoctorsModal can show the *actual* reason a load failed —
   * e.g. "relation \"public.doctors\" does not exist" means the
   * supabase/admin_doctors_treatments_noshow.sql migration hasn't been
   * run yet on this project; "permission denied for table doctors" means
   * an RLS/grant problem; anything else (network, etc.) shows as-is.
   * See supabase/README.md for how to read/act on these messages.
   */
  async function fetchDoctors() {
    setDoctorsLoadState("loading");
    setDoctorsLoadError(null);
    try {
      const supabase = createClient();

      // TEMP DIAGNOSTIC — see fetchAppointments() above for why this is
      // logged: we need to know whether the browser actually holds an
      // authenticated session at the moment this query runs, not just
      // assume it does because the page rendered.
      const {
        data: { session },
      } = await supabase.auth.getSession();
      // eslint-disable-next-line no-console
      console.log("[fetchDoctors] Supabase session", {
        hasSession: !!session,
        userId: session?.user?.id,
        email: session?.user?.email,
        role: session?.user?.role,
        tokenExpiresAt: session?.expires_at,
      });

      const { data, error } = await supabase
        .from("doctors")
        .select("id, name, credentials, specialty, description, experience, is_active, sort_order, created_at")
        .eq("is_active", true)
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: true });

      if (error) {
        // TEMP DIAGNOSTIC: log every field, plus the raw error object
        // itself (some Supabase/PostgREST error shapes only show their
        // real content when logged as the object directly rather than
        // destructured — logging both ways so nothing is hidden).
        // eslint-disable-next-line no-console
        console.error("[fetchDoctors] Supabase error", {
          error,
          message: error?.message,
          details: error?.details,
          hint: error?.hint,
          code: error?.code,
          name: error?.name,
        });
        setDoctorsLoadError(
          [error?.message, error?.code ? `(code: ${error.code})` : null]
            .filter(Boolean)
            .join(" ") || "Unknown Supabase error.",
        );
        setDoctorsLoadState("error");
        return;
      }

      setDoctors((data ?? []) as Doctor[]);
      setDoctorsLoadState("loaded");
    } catch (err) {
      console.error("[fetchDoctors] Unexpected error loading public.doctors", err);
      setDoctorsLoadError(err instanceof Error ? err.message : "Unexpected error.");
      setDoctorsLoadState("error");
    }
  }

  /**
   * Loads public.treatments. See fetchDoctors() above — same
   * never-swallow-the-real-error approach.
   */
  async function fetchTreatments() {
    setTreatmentsLoadState("loading");
    setTreatmentsLoadError(null);
    try {
      const supabase = createClient();

      // TEMP DIAGNOSTIC — see fetchDoctors() above.
      const {
        data: { session },
      } = await supabase.auth.getSession();
      // eslint-disable-next-line no-console
      console.log("[fetchTreatments] Supabase session", {
        hasSession: !!session,
        userId: session?.user?.id,
        email: session?.user?.email,
        role: session?.user?.role,
        tokenExpiresAt: session?.expires_at,
      });

      const { data, error } = await supabase
        .from("treatments")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: true });

      if (error) {
        // TEMP DIAGNOSTIC: same reasoning as fetchDoctors() above — log
        // the raw error object as well as its destructured fields.
        // eslint-disable-next-line no-console
        console.error("[fetchTreatments] Supabase error", {
          error,
          message: error?.message,
          details: error?.details,
          hint: error?.hint,
          code: error?.code,
          name: error?.name,
        });
        setTreatmentsLoadError(
          [error?.message, error?.code ? `(code: ${error.code})` : null]
            .filter(Boolean)
            .join(" ") || "Unknown Supabase error.",
        );
        setTreatmentsLoadState("error");
        return;
      }

      setTreatments((data ?? []) as AdminTreatment[]);
      setTreatmentsLoadState("loaded");
    } catch (err) {
      console.error("[fetchTreatments] Unexpected error loading public.treatments", err);
      setTreatmentsLoadError(err instanceof Error ? err.message : "Unexpected error.");
      setTreatmentsLoadState("error");
    }
  }

  useEffect(() => {
    fetchAppointments();
    fetchDoctors();
    fetchTreatments();
    fetchTestimonials();
    fetchClinicSettings();
    fetchClinicGallery();
  }, []);

  useEffect(() => {
    if (!banner) return;
    const timer = setTimeout(() => setBanner(null), 4000);
    return () => clearTimeout(timer);
  }, [banner]);

  useEffect(() => {
    function handleSettingsAction(event: Event) {
      const action = (event as CustomEvent<{ action?: string }>).detail?.action;

      switch (action) {
        case "doctors":
          setIsDoctorsModalOpen(true);
          break;
        case "treatments":
          setIsTreatmentsModalOpen(true);
          break;
        case "testimonials":
          setIsTestimonialsModalOpen(true);
          break;
        case "clinic":
          setIsClinicInfoModalOpen(true);
          break;
        case "bin":
          setIsBinOpen(true);
          break;
        default:
          break;
      }
    }

    window.addEventListener("admin-settings-action", handleSettingsAction);
    return () => window.removeEventListener("admin-settings-action", handleSettingsAction);
  }, []);

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
      no_show: 0,
    };

    for (const appointment of activeAppointments) {
      counts[appointment.status] = (counts[appointment.status] ?? 0) + 1;
    }

    return counts;
  }, [activeAppointments]);

  async function fetchClinicSettings() {
    setClinicSettingsLoadState("loading");
    setClinicSettingsLoadError(null);

    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("clinic_settings")
        .select("*")
        .order("created_at", { ascending: true })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error("[fetchClinicSettings] Supabase error", {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint,
          fullError: error,
        });
        setClinicSettingsLoadError(
          [error.message, error.code ? `(code: ${error.code})` : null].filter(Boolean).join(" ") ||
            "Unknown Supabase error.",
        );
        setClinicSettingsLoadState("error");
        return;
      }

      setClinicSettings((data ?? null) as ClinicSettings | null);
      setClinicSettingsLoadState("loaded");
    } catch (err) {
      console.error("[fetchClinicSettings] Unexpected error", err);
      setClinicSettingsLoadError(err instanceof Error ? err.message : "Unexpected error.");
      setClinicSettingsLoadState("error");
    }
  }

  async function fetchClinicGallery() {
    setClinicGalleryLoadState("loading");
    setClinicGalleryLoadError(null);

    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("clinic_gallery")
        .select("*")
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: true });

      if (error) {
        console.error("[fetchClinicGallery] Supabase error", {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint,
          fullError: error,
        });
        setClinicGalleryLoadError(
          [error.message, error.code ? `(code: ${error.code})` : null].filter(Boolean).join(" ") ||
            "Unknown Supabase error.",
        );
        setClinicGalleryLoadState("error");
        return;
      }

      setClinicGalleryImages((data ?? []) as ClinicGalleryImage[]);
      setClinicGalleryLoadState("loaded");
    } catch (err) {
      console.error("[fetchClinicGallery] Unexpected error", err);
      setClinicGalleryLoadError(err instanceof Error ? err.message : "Unexpected error.");
      setClinicGalleryLoadState("error");
    }
  }

  async function handleSaveClinicSettings(values: Record<string, string | number | null>) {
    setIsSavingClinicInfo(true);
    try {
      const supabase = createClient();
      const payload = {
        clinic_name: String(values.clinic_name ?? "SPM Dental Care").trim() || "SPM Dental Care",
        location_heading: String(values.location_heading ?? "Find us in Kumananchavadi").trim() || "Find us in Kumananchavadi",
        location_subtitle: String(values.location_subtitle ?? "").trim() || null,
        business_name: String(values.business_name ?? "").trim() || null,
        address_line_1: String(values.address_line_1 ?? "").trim() || null,
        address_line_2: String(values.address_line_2 ?? "").trim() || null,
        city: String(values.city ?? "").trim() || null,
        state: String(values.state ?? "").trim() || null,
        pincode: String(values.pincode ?? "").trim() || null,
        country: String(values.country ?? "").trim() || null,
        map_url: String(values.map_url ?? "").trim() || null,
        latitude: values.latitude === null || values.latitude === undefined || values.latitude === "" ? null : Number(values.latitude),
        longitude: values.longitude === null || values.longitude === undefined || values.longitude === "" ? null : Number(values.longitude),
        contact_number: String(values.contact_number ?? "").trim() || null,
        opening_hours: String(values.opening_hours ?? "").trim() || null,
      };

      const query = clinicSettings?.id
        ? supabase.from("clinic_settings").update(payload).eq("id", clinicSettings.id)
        : supabase.from("clinic_settings").insert(payload).select().single();

      const { data, error } = await query;

      if (error || !data) {
        console.error("[handleSaveClinicSettings] Supabase update/insert failed", {
          message: error?.message,
          code: error?.code,
          details: error?.details,
          hint: error?.hint,
          fullError: error,
        });
        setBanner({
          type: "error",
          message: error ? `Couldn't save clinic information: ${error.message}` : "Couldn't save clinic information.",
        });
        return;
      }

      setClinicSettings(data as ClinicSettings);
      setBanner({ type: "success", message: "Clinic information saved." });
      setIsClinicInfoModalOpen(false);
    } catch (err) {
      console.error("[handleSaveClinicSettings] Unexpected error", err);
      setBanner({ type: "error", message: ACTION_ERROR_MESSAGE });
    } finally {
      setIsSavingClinicInfo(false);
    }
  }

  async function handleAddGalleryImage(file: File, title?: string) {
    setClinicInfoBusyId("upload");
    try {
      const supabase = createClient();
      const ext = file.name.includes(".") ? file.name.slice(file.name.lastIndexOf(".")) : "";
      const filePath = `clinic-gallery/${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("clinic-gallery")
        .upload(filePath, file, { upsert: false, contentType: file.type || "image/jpeg" });

      if (uploadError || !uploadData) {
        console.error("[handleAddGalleryImage] Storage upload failed", {
          message: uploadError?.message,
          code: uploadError?.status,
          fullError: uploadError,
        });
        setBanner({ type: "error", message: uploadError ? `Couldn't upload image: ${uploadError.message}` : "Couldn't upload image." });
        return;
      }

      const publicUrl = supabase.storage.from("clinic-gallery").getPublicUrl(uploadData.path).data.publicUrl;
      const nextSort = clinicGalleryImages.length === 0 ? 1 : Math.max(...clinicGalleryImages.map((image) => image.sort_order)) + 1;
      const { data, error } = await supabase
        .from("clinic_gallery")
        .insert({
          title: title?.trim() || null,
          image_url: publicUrl,
          storage_path: uploadData.path,
          sort_order: nextSort,
          is_active: true,
        })
        .select()
        .single();

      if (error || !data) {
        console.error("[handleAddGalleryImage] DB insert failed", {
          message: error?.message,
          code: error?.code,
          details: error?.details,
          hint: error?.hint,
          fullError: error,
        });
        setBanner({ type: "error", message: error ? `Couldn't save gallery image: ${error.message}` : "Couldn't save gallery image." });
        return;
      }

      setClinicGalleryImages((current) => [...current, data as ClinicGalleryImage].sort((a, b) => a.sort_order - b.sort_order));
      setBanner({ type: "success", message: "Gallery image uploaded." });
    } catch (err) {
      console.error("[handleAddGalleryImage] Unexpected error", err);
      setBanner({ type: "error", message: ACTION_ERROR_MESSAGE });
    } finally {
      setClinicInfoBusyId(null);
    }
  }

  async function handleReplaceGalleryImage(image: ClinicGalleryImage, file: File) {
    setClinicInfoBusyId(image.id);
    try {
      const supabase = createClient();
      const nextPath = image.storage_path || `clinic-gallery/${Date.now()}-${Math.random().toString(36).slice(2)}.${file.name.split(".").pop() || "jpg"}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("clinic-gallery")
        .upload(nextPath, file, { upsert: true, contentType: file.type || "image/jpeg" });

      if (uploadError || !uploadData) {
        console.error("[handleReplaceGalleryImage] Storage upload failed", {
          message: uploadError?.message,
          code: uploadError?.status,
          fullError: uploadError,
        });
        setBanner({ type: "error", message: uploadError ? `Couldn't replace image: ${uploadError.message}` : "Couldn't replace image." });
        return;
      }

      const publicUrl = supabase.storage.from("clinic-gallery").getPublicUrl(uploadData.path).data.publicUrl;
      const { data, error } = await supabase
        .from("clinic_gallery")
        .update({ image_url: publicUrl, storage_path: uploadData.path, updated_at: new Date().toISOString() })
        .eq("id", image.id)
        .select()
        .single();

      if (error || !data) {
        console.error("[handleReplaceGalleryImage] DB update failed", {
          message: error?.message,
          code: error?.code,
          details: error?.details,
          hint: error?.hint,
          fullError: error,
        });
        setBanner({ type: "error", message: error ? `Couldn't save replacement image: ${error.message}` : "Couldn't save replacement image." });
        return;
      }

      setClinicGalleryImages((current) =>
        current.map((item) => (item.id === image.id ? (data as ClinicGalleryImage) : item)).sort((a, b) => a.sort_order - b.sort_order),
      );
      setBanner({ type: "success", message: "Gallery image replaced." });
    } catch (err) {
      console.error("[handleReplaceGalleryImage] Unexpected error", err);
      setBanner({ type: "error", message: ACTION_ERROR_MESSAGE });
    } finally {
      setClinicInfoBusyId(null);
    }
  }

  async function handleRemoveGalleryImage(image: ClinicGalleryImage) {
    setClinicInfoBusyId(image.id);
    try {
      const supabase = createClient();
      if (image.storage_path) {
        const { error: deleteStorageError } = await supabase.storage.from("clinic-gallery").remove([image.storage_path]);
        if (deleteStorageError) {
          console.error("[handleRemoveGalleryImage] Storage delete failed", {
            message: deleteStorageError.message,
            code: deleteStorageError.status,
            fullError: deleteStorageError,
          });
        }
      }

      const { error } = await supabase.from("clinic_gallery").delete().eq("id", image.id);
      if (error) {
        console.error("[handleRemoveGalleryImage] DB delete failed", {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint,
          fullError: error,
        });
        setBanner({ type: "error", message: `Couldn't remove image: ${error.message}` });
        return;
      }

      setClinicGalleryImages((current) => current.filter((item) => item.id !== image.id));
      setBanner({ type: "success", message: "Gallery image removed." });
    } catch (err) {
      console.error("[handleRemoveGalleryImage] Unexpected error", err);
      setBanner({ type: "error", message: ACTION_ERROR_MESSAGE });
    } finally {
      setClinicInfoBusyId(null);
    }
  }

  async function handleReorderGalleryImage(image: ClinicGalleryImage, direction: "up" | "down") {
    setClinicInfoBusyId(image.id);
    try {
      const supabase = createClient();
      const currentIndex = clinicGalleryImages.findIndex((item) => item.id === image.id);
      const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
      if (currentIndex < 0 || targetIndex < 0 || targetIndex >= clinicGalleryImages.length) {
        return;
      }

      const targetImage = clinicGalleryImages[targetIndex];
      if (!targetImage) {
        return;
      }

      const currentSortOrder = image.sort_order;
      const nextSortOrder = targetImage.sort_order;

      const { error: firstError } = await supabase
        .from("clinic_gallery")
        .update({ sort_order: nextSortOrder })
        .eq("id", image.id);

      const { error: secondError } = await supabase
        .from("clinic_gallery")
        .update({ sort_order: currentSortOrder })
        .eq("id", targetImage.id);

      if (firstError || secondError) {
        console.error("[handleReorderGalleryImage] Reorder failed", {
          firstError,
          secondError,
        });
        setBanner({ type: "error", message: "Couldn't reorder gallery image." });
        return;
      }

      setClinicGalleryImages((current) =>
        [...current]
          .map((item) => {
            if (item.id === image.id) return { ...item, sort_order: nextSortOrder };
            if (item.id === targetImage.id) return { ...item, sort_order: currentSortOrder };
            return item;
          })
          .sort((a, b) => a.sort_order - b.sort_order),
      );
    } catch (err) {
      console.error("[handleReorderGalleryImage] Unexpected error", err);
      setBanner({ type: "error", message: ACTION_ERROR_MESSAGE });
    } finally {
      setClinicInfoBusyId(null);
    }
  }

  async function handleToggleGalleryImageActive(image: ClinicGalleryImage) {
    setClinicInfoBusyId(image.id);
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("clinic_gallery")
        .update({ is_active: !image.is_active })
        .eq("id", image.id)
        .select()
        .single();

      if (error || !data) {
        console.error("[handleToggleGalleryImageActive] DB update failed", {
          message: error?.message,
          code: error?.code,
          details: error?.details,
          hint: error?.hint,
          fullError: error,
        });
        setBanner({ type: "error", message: error ? `Couldn't update gallery image: ${error.message}` : "Couldn't update gallery image." });
        return;
      }

      setClinicGalleryImages((current) =>
        current.map((item) => (item.id === image.id ? (data as ClinicGalleryImage) : item)).sort((a, b) => a.sort_order - b.sort_order),
      );
      setBanner({ type: "success", message: `${(data as ClinicGalleryImage).is_active ? "Enabled" : "Disabled"} gallery image.` });
    } catch (err) {
      console.error("[handleToggleGalleryImageActive] Unexpected error", err);
      setBanner({ type: "error", message: ACTION_ERROR_MESSAGE });
    } finally {
      setClinicInfoBusyId(null);
    }
  }

  /** Fetch admin testimonials */
  async function fetchTestimonials() {
    setTestimonialsLoadState("loading");
    setTestimonialsLoadError(null);
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("testimonials")
        .select("*")
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: true });

      if (error) {
        console.error("[fetchTestimonials] Supabase error", error);
        setTestimonialsLoadError(error?.message ?? "Unknown Supabase error.");
        setTestimonialsLoadState("error");
        return;
      }

      setTestimonials((data ?? []) as AdminTestimonial[]);
      setTestimonialsLoadState("loaded");
    } catch (err) {
      console.error("[fetchTestimonials] Unexpected error loading public.testimonials", err);
      setTestimonialsLoadError(err instanceof Error ? err.message : "Unexpected error.");
      setTestimonialsLoadState("error");
    }
  }

  async function handleAddTestimonial(values: { patient_name: string; review_text: string; rating: number; source: string; sort_order: number }) {
    setIsSavingTestimonial(true);
    try {
      const supabase = createClient();
      const nextSortOrder = values.sort_order ?? Math.max(0, ...testimonials.map((t) => t.sort_order || 0)) + 1;
      const { data, error } = await supabase
        .from("testimonials")
        .insert({ ...values, sort_order: nextSortOrder })
        .select()
        .single();

      if (error || !data) {
        const supabaseError = error ?? {
          message: "No data returned from Supabase insert.",
          code: "NO_DATA",
          details: null,
          hint: null,
        };

        console.error("[handleAddTestimonial] Supabase insert failed", {
          message: supabaseError.message,
          code: supabaseError.code,
          details: supabaseError.details,
          hint: supabaseError.hint,
          fullError: supabaseError,
        });

        setBanner({
          type: "error",
          message: supabaseError.message || "Couldn't add review.",
        });

        return;
      }

      setTestimonials((current) =>
        [data as AdminTestimonial, ...current].sort(
          (a, b) =>
            (a.sort_order ?? 0) - (b.sort_order ?? 0) ||
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
        ),
      );
      setBanner({ type: "success", message: `Added review for ${(data as AdminTestimonial).patient_name}.` });
    } catch (err) {
      console.error("[handleAddTestimonial] Unexpected error", err);
      setBanner({ type: "error", message: ACTION_ERROR_MESSAGE });
    } finally {
      setIsSavingTestimonial(false);
    }
  }

  async function handleRemoveTestimonial(testimonial: AdminTestimonial) {
    setTestimonialBusyId(testimonial.id);
    try {
      const supabase = createClient();
      const { error } = await supabase.from("testimonials").delete().eq("id", testimonial.id);
      if (error) {
        console.error("[handleRemoveTestimonial] Supabase error deleting public.testimonials", error);
        setBanner({ type: "error", message: `Couldn't remove review: ${error.message}` });
      } else {
        setTestimonials((current) => current.filter((t) => t.id !== testimonial.id));
        setBanner({ type: "success", message: `Removed review for ${testimonial.patient_name}.` });
      }
    } catch (err) {
      console.error("[handleRemoveTestimonial] Unexpected error", err);
      setBanner({ type: "error", message: ACTION_ERROR_MESSAGE });
    } finally {
      setTestimonialBusyId(null);
    }
  }

  async function handleUpdateTestimonial(updated: AdminTestimonial) {
    setTestimonialBusyId(updated.id);
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("testimonials")
        .update({
          patient_name: updated.patient_name,
          review_text: updated.review_text,
          rating: updated.rating,
          source: updated.source,
          is_active: updated.is_active,
          sort_order: updated.sort_order ?? 100,
        })
        .eq("id", updated.id)
        .select()
        .single();

      if (error || !data) {
        console.error("[handleUpdateTestimonial] Supabase error updating public.testimonials", error);
        setBanner({ type: "error", message: error ? `Couldn't update review: ${error.message}` : ACTION_ERROR_MESSAGE });
        return;
      }

      setTestimonials((current) =>
        current
          .map((t) => (t.id === updated.id ? (data as AdminTestimonial) : t))
          .sort(
            (a, b) =>
              (a.sort_order ?? 0) - (b.sort_order ?? 0) ||
              new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
          ),
      );
      setBanner({ type: "success", message: `Updated review for ${(data as AdminTestimonial).patient_name}.` });
    } catch (err) {
      console.error("[handleUpdateTestimonial] Unexpected error", err);
      setBanner({ type: "error", message: ACTION_ERROR_MESSAGE });
    } finally {
      setTestimonialBusyId(null);
    }
  }

  async function handleToggleTestimonialActive(testimonial: AdminTestimonial) {
    setTestimonialBusyId(testimonial.id);
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("testimonials")
        .update({ is_active: !testimonial.is_active })
        .eq("id", testimonial.id)
        .select()
        .single();

      if (error || !data) {
        console.error("[handleToggleTestimonialActive] Supabase error updating is_active", error);
        setBanner({ type: "error", message: error ? `Couldn't update review: ${error.message}` : ACTION_ERROR_MESSAGE });
        return;
      }

      setTestimonials((current) =>
        current
          .map((t) => (t.id === testimonial.id ? (data as AdminTestimonial) : t))
          .sort(
            (a, b) =>
              (a.sort_order ?? 0) - (b.sort_order ?? 0) ||
              new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
          ),
      );
      setBanner({ type: "success", message: `${(data as AdminTestimonial).is_active ? "Enabled" : "Disabled"} review for ${(data as AdminTestimonial).patient_name}.` });
    } catch (err) {
      console.error("[handleToggleTestimonialActive] Unexpected error", err);
      setBanner({ type: "error", message: ACTION_ERROR_MESSAGE });
    } finally {
      setTestimonialBusyId(null);
    }
  }

  const summaryCards: Array<{
    key: "all" | AppointmentStatus;
    label: string;
    count: number;
  }> = [
    {
      key: "all",
      label: "Total",
      count: activeAppointments.length,
    },
    {
      key: "pending",
      label: "Pending",
      count: statusCounts.pending,
    },
    {
      key: "confirmed",
      label: "Confirmed",
      count: statusCounts.confirmed,
    },
    {
      key: "completed",
      label: "Completed",
      count: statusCounts.completed,
    },
    {
      key: "cancelled",
      label: "Cancelled",
      count: statusCounts.cancelled,
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

  // Pagination (Admin Dashboard requirement 4). Purely a client-side slice
  // of `filteredAppointments` — the existing architecture already loads
  // every active appointment into memory and filters it there, so this
  // keeps that same approach rather than introducing a separate
  // server-side paging query. Every summary count/statistic above is
  // computed from `activeAppointments`/`statusCounts`, never from the
  // paginated slice, so pagination can never skew them.
  const totalPages = Math.max(1, Math.ceil(filteredAppointments.length / APPOINTMENTS_PAGE_SIZE));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedAppointments = useMemo(() => {
    const start = (safeCurrentPage - 1) * APPOINTMENTS_PAGE_SIZE;
    return filteredAppointments.slice(start, start + APPOINTMENTS_PAGE_SIZE);
  }, [filteredAppointments, safeCurrentPage]);

  // Reset to page 1 whenever search/status/date filters change, so an
  // admin never lands on a now-empty page after narrowing results.
  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter, dateFilterMode, customDate]);

  // Treatment option list fed to the "+ New Appointment" form and the
  // inline treatment editor. Falls back to the static
  // ADMIN_TREATMENT_OPTIONS if the database list hasn't loaded yet (or
  // failed to load) so those pickers are never left empty.
  const treatmentOptions = useMemo(
    () => (treatments.length > 0 ? treatments.map((treatment) => treatment.name) : ADMIN_TREATMENT_OPTIONS),
    [treatments],
  );

  const viewingAppointment = useMemo(
    () => activeAppointments.find((appointment) => appointment.id === viewingAppointmentId) ?? null,
    [activeAppointments, viewingAppointmentId],
  );

  const viewingArchivedAppointment = useMemo(
    () => archivedAppointments.find((appointment) => appointment.id === viewingArchivedId) ?? null,
    [archivedAppointments, viewingArchivedId],
  );

  async function handleStatusChange(id: string, status: AppointmentStatus): Promise<boolean> {
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
        return false;
      }

      setBanner({ type: "success", message: `Status updated to "${status}".` });
      return true;
    } catch {
      setAppointments(previous);
      setBanner({ type: "error", message: ACTION_ERROR_MESSAGE });
      return false;
    } finally {
      setBusyId(null);
    }
  }

  /**
   * Entry point passed to the table/details modal for the status <select>.
   * Status changes are always direct updates here. The dedicated
   * confirmation/date-time modal remains an explicit, separate action and
   * is never triggered as a side effect of selecting a status value.
   */
  function handleStatusSelectChange(id: string, status: AppointmentStatus): Promise<boolean> {
    return handleStatusChange(id, status);
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

  async function handlePreferredDateTimeUpdate(
    id: string,
    preferredDate: string,
    preferredTime: string | null,
  ): Promise<boolean> {
    const previous = appointments.find((appointment) => appointment.id === id);
    if (!previous) return false;

    const nextDate = preferredDate || previous.preferred_date;
    const nextTime = preferredTime && preferredTime.length > 0 ? preferredTime : null;

    setBusyId(id);
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("appointments")
        .update({ preferred_date: nextDate, preferred_time: nextTime })
        .eq("id", id)
        .select()
        .single();

      if (error || !data) {
        setBanner({ type: "error", message: ACTION_ERROR_MESSAGE });
        return false;
      }

      const updated = data as Appointment;
      setAppointments((current) =>
        current.map((appointment) => (appointment.id === id ? updated : appointment)),
      );
      setBanner({
        type: "success",
        message: `Updated appointment date and time for ${updated.patient_name}.`,
      });
      return true;
    } catch {
      setBanner({ type: "error", message: ACTION_ERROR_MESSAGE });
      return false;
    } finally {
      setBusyId(null);
    }
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

  /** Add a doctor (Admin Dashboard requirement 1). */
  async function handleAddDoctor(values: NewDoctorValues) {
    setIsSavingDoctor(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("doctors")
        .insert({
          name: values.name,
          credentials: values.credentials || null,
          specialty: values.specialty || null,
          description: values.description || null,
          experience: Number.isFinite(values.experience) ? Math.max(0, values.experience) : 0,
        })
        .select()
        .single();

      if (error || !data) {
        console.error("[handleAddDoctor] Supabase error inserting into public.doctors", error);
        setBanner({
          type: "error",
          message: error ? `Couldn't add doctor: ${error.message}` : ACTION_ERROR_MESSAGE,
        });
        return;
      }

      setDoctors((current) => [...current, data as Doctor]);
      setBanner({ type: "success", message: `Added ${(data as Doctor).name}.` });
    } catch (err) {
      console.error("[handleAddDoctor] Unexpected error", err);
      setBanner({ type: "error", message: ACTION_ERROR_MESSAGE });
    } finally {
      setIsSavingDoctor(false);
    }
  }

  /**
   * Remove a doctor. Deactivates (is_active = false) rather than deleting
   * the row — a safe, reversible action. Nothing else in this project
   * references a doctor by id (appointments don't store a doctor
   * reference), so this can never corrupt appointment history.
   */
  async function handleRemoveDoctor(doctor: Doctor) {
    setDoctorBusyId(doctor.id);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("doctors")
        .update({ is_active: false })
        .eq("id", doctor.id);

      if (error) {
        console.error("[handleRemoveDoctor] Supabase error updating public.doctors", error);
        setBanner({ type: "error", message: `Couldn't remove doctor: ${error.message}` });
      } else {
        setDoctors((current) => current.filter((d) => d.id !== doctor.id));
        setBanner({ type: "success", message: `Removed ${doctor.name}.` });
      }
    } catch (err) {
      console.error("[handleRemoveDoctor] Unexpected error", err);
      setBanner({ type: "error", message: ACTION_ERROR_MESSAGE });
    } finally {
      setDoctorBusyId(null);
    }
  }

  /** Add a treatment (Admin Dashboard requirement 2). */
  async function handleAddTreatment(name: string) {
    setIsSavingTreatment(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("treatments")
        .insert({ name })
        .select()
        .single();

      if (error || !data) {
        console.error("[handleAddTreatment] Supabase error inserting into public.treatments", error);
        setBanner({
          type: "error",
          message: error ? `Couldn't add treatment: ${error.message}` : ACTION_ERROR_MESSAGE,
        });
        return;
      }

      setTreatments((current) => [...current, data as AdminTreatment]);
      setBanner({ type: "success", message: `Added "${(data as AdminTreatment).name}".` });
    } catch (err) {
      console.error("[handleAddTreatment] Unexpected error", err);
      setBanner({ type: "error", message: ACTION_ERROR_MESSAGE });
    } finally {
      setIsSavingTreatment(false);
    }
  }

  /**
   * Remove a treatment. Deactivates (is_active = false) rather than
   * deleting the row. appointments.treatment stores the treatment name as
   * plain text, not a reference to this table, so removing an option here
   * never changes or corrupts any existing appointment's stored value.
   */
  async function handleRemoveTreatment(treatment: AdminTreatment) {
    setTreatmentBusyId(treatment.id);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("treatments")
        .update({ is_active: false })
        .eq("id", treatment.id);

      if (error) {
        console.error("[handleRemoveTreatment] Supabase error updating public.treatments", error);
        setBanner({ type: "error", message: `Couldn't remove treatment: ${error.message}` });
      } else {
        setTreatments((current) => current.filter((t) => t.id !== treatment.id));
        setBanner({ type: "success", message: `Removed "${treatment.name}".` });
      }
    } catch (err) {
      console.error("[handleRemoveTreatment] Unexpected error", err);
      setBanner({ type: "error", message: ACTION_ERROR_MESSAGE });
    } finally {
      setTreatmentBusyId(null);
    }
  }

  return (
    <div className="flex flex-col gap-6 pb-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h1 className="admin-heading font-display text-2xl leading-tight text-[var(--admin-text)]">Appointments</h1>
          <p className="text-sm text-[var(--admin-text-soft)]">
            Manage appointment requests submitted from the website.
          </p>
        </div>
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
                  className={`admin-status-card rounded-card border p-4 text-left transition-colors focus:outline-none focus:ring-2 focus:ring-blue-600 ${
                    isActive ? "selected" : ""
                  }`}
                >
                  <div className="admin-status-label text-xs font-medium uppercase tracking-wide">
                    {card.label}
                  </div>
                  <div className="admin-status-value mt-1 text-2xl font-semibold">{card.count}</div>
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

      <div className="flex flex-col gap-3 rounded-2xl border border-line bg-[var(--admin-surface-strong)] p-3 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by name or phone"
            className="w-full rounded-xl border border-line bg-[var(--admin-surface)] px-3.5 py-2.5 text-sm text-[var(--admin-text)] placeholder:text-[var(--admin-text-soft)] focus:border-blue-600 focus:outline-none sm:max-w-xs"
          />
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as "all" | AppointmentStatus)}
            className="rounded-xl border border-line bg-[var(--admin-surface)] px-3.5 py-2.5 text-sm text-[var(--admin-text)] focus:border-blue-600 focus:outline-none"
          >
            <option value="all">All statuses</option>
            {APPOINTMENT_STATUSES.map((status) => (
              <option key={status} value={status} className="capitalize">
                {status}
              </option>
            ))}
            <option value="no_show">No Show</option>
          </select>
          <select
            value={dateFilterMode}
            onChange={(event) => {
              const mode = event.target.value as DateFilterMode;
              setDateFilterMode(mode);
              if (mode !== "custom") setCustomDate("");
            }}
            className="rounded-xl border border-line bg-[var(--admin-surface)] px-3.5 py-2.5 text-sm text-[var(--admin-text)] focus:border-blue-600 focus:outline-none"
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
              className="rounded-xl border border-line bg-[var(--admin-surface)] px-3.5 py-2.5 text-sm text-[var(--admin-text)] focus:border-blue-600 focus:outline-none"
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
            className="inline-flex items-center justify-center whitespace-nowrap rounded-full bg-blue-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-800"
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
        <>
          <AppointmentsTable
            appointments={paginatedAppointments}
            busyId={busyId}
            treatmentOptions={treatmentOptions}
            onStatusChange={handleStatusSelectChange}
            onArchiveRequest={setPendingArchive}
            onViewRequest={(appointment) => setViewingAppointmentId(appointment.id)}
            onPreferredDateTimeUpdate={handlePreferredDateTimeUpdate}
            editingTreatmentId={editingTreatmentId}
            treatmentDraft={treatmentDraft}
            onEditTreatmentStart={handleEditTreatmentStart}
            onEditTreatmentCancel={handleEditTreatmentCancel}
            onTreatmentDraftChange={setTreatmentDraft}
            onEditTreatmentSave={handleEditTreatmentSave}
          />
          <PaginationControls
            currentPage={safeCurrentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </>
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
          treatmentOptions={treatmentOptions}
          onClose={() => setViewingAppointmentId(null)}
          onStatusChange={handleStatusSelectChange}
          onPreferredDateTimeUpdate={handlePreferredDateTimeUpdate}
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
          treatmentOptions={treatmentOptions}
          onCancel={() => setIsNewAppointmentOpen(false)}
          onSave={handleCreateAppointment}
        />
      ) : null}

      {isDoctorsModalOpen ? (
        <ManageDoctorsModal
          doctors={doctors}
          isLoading={doctorsLoadState === "loading"}
          loadError={doctorsLoadState === "error"}
          loadErrorMessage={doctorsLoadError}
          busyId={doctorBusyId}
          isSaving={isSavingDoctor}
          onClose={() => setIsDoctorsModalOpen(false)}
          onAdd={handleAddDoctor}
          onRemove={handleRemoveDoctor}
          onRetry={fetchDoctors}
        />
      ) : null}

      {isTreatmentsModalOpen ? (
        <ManageTreatmentsModal
          treatments={treatments}
          isLoading={treatmentsLoadState === "loading"}
          loadError={treatmentsLoadState === "error"}
          loadErrorMessage={treatmentsLoadError}
          busyId={treatmentBusyId}
          isSaving={isSavingTreatment}
          onClose={() => setIsTreatmentsModalOpen(false)}
          onAdd={handleAddTreatment}
          onRemove={handleRemoveTreatment}
          onRetry={fetchTreatments}
        />
      ) : null}

      {isTestimonialsModalOpen ? (
        <ManageTestimonialsModal
          testimonials={testimonials}
          isLoading={testimonialsLoadState === "loading"}
          loadError={testimonialsLoadState === "error"}
          loadErrorMessage={testimonialsLoadError}
          busyId={testimonialBusyId}
          isSaving={isSavingTestimonial}
          onClose={() => setIsTestimonialsModalOpen(false)}
          onAdd={handleAddTestimonial}
          onRemove={handleRemoveTestimonial}
          onUpdate={handleUpdateTestimonial}
          onToggleActive={handleToggleTestimonialActive}
          onRetry={fetchTestimonials}
        />
      ) : null}

      {isClinicInfoModalOpen ? (
        <ManageClinicInfoModal
          settings={clinicSettings}
          galleryImages={clinicGalleryImages}
          isLoading={clinicSettingsLoadState === "loading" || clinicGalleryLoadState === "loading"}
          isSaving={isSavingClinicInfo}
          busyId={clinicInfoBusyId}
          onClose={() => setIsClinicInfoModalOpen(false)}
          onSaveSettings={handleSaveClinicSettings}
          onAddGalleryImage={handleAddGalleryImage}
          onReplaceGalleryImage={handleReplaceGalleryImage}
          onRemoveGalleryImage={handleRemoveGalleryImage}
          onReorderGalleryImage={handleReorderGalleryImage}
          onToggleGalleryImageActive={handleToggleGalleryImageActive}
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
