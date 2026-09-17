"use client";

import { useState } from "react";
import type { AdminTestimonial } from "@/types/admin";
import SettingsActionIcon from "./SettingsActionIcon";

interface ManageTestimonialsModalProps {
  testimonials: AdminTestimonial[];
  isLoading: boolean;
  loadError: boolean;
  loadErrorMessage?: string | null;
  busyId: string | null;
  isSaving: boolean;
  onClose: () => void;
  onAdd: (values: { patient_name: string; review_text: string; rating: number; source: string; sort_order: number }) => void;
  onRemove: (testimonial: AdminTestimonial) => void;
  onUpdate: (testimonial: AdminTestimonial) => void;
  onToggleActive?: (testimonial: AdminTestimonial) => void;
  onRetry?: () => void;
}

const inputClasses =
  "w-full rounded-lg border border-line bg-canvas px-3 py-2 text-sm text-ink placeholder:text-ink/40 focus:border-blue-600 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60";

export default function ManageTestimonialsModal({
  testimonials,
  isLoading,
  loadError,
  loadErrorMessage,
  busyId,
  isSaving,
  onClose,
  onAdd,
  onRemove,
  onUpdate,
  onToggleActive,
  onRetry,
}: ManageTestimonialsModalProps) {
  const [patientName, setPatientName] = useState("");
  const [reviewText, setReviewText] = useState("");
  const [rating, setRating] = useState(5);
  const [source, setSource] = useState("Google");
  const [sortOrder, setSortOrder] = useState(100);
  const [formError, setFormError] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingDraft, setEditingDraft] = useState<Partial<AdminTestimonial> | null>(null);

  function resetForm() {
	setPatientName("");
	setReviewText("");
	setRating(5);
	setSource("Google");
	setSortOrder(100);
	setFormError(null);
  }

  function handleSubmit(event: React.FormEvent) {
	event.preventDefault();
	if (isSaving) return;
	const name = patientName.trim();
	const text = reviewText.trim();
	if (!name) return setFormError("Please enter the patient's name.");
	if (!text) return setFormError("Please enter the review text.");
	if (rating < 1 || rating > 5) return setFormError("Rating must be between 1 and 5.");
	setFormError(null);
	onAdd({
	  patient_name: name,
	  review_text: text,
	  rating,
	  source: source.trim() || "Google",
	  sort_order: Number.isFinite(sortOrder) ? sortOrder : 100,
	});
	resetForm();
  }

  return (
	<div
	  role="dialog"
	  aria-modal="true"
	  aria-labelledby="manage-testimonials-heading"
	  className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-ink/40 px-4 py-8"
	  onClick={onClose}
	>
	  <div
		className="w-full max-w-2xl rounded-card border border-line bg-canvas p-4 sm:p-6"
		onClick={(e) => e.stopPropagation()}
	  >
		<div className="flex items-start justify-between gap-4">
		  <div>
			<h2 id="manage-testimonials-heading" className="font-display text-lg text-ink">
			  Manage Patient Reviews
			</h2>
			<p className="mt-1 text-sm text-ink/60">Add, edit, or remove patient reviews shown on the public site.</p>
		  </div>
		 <SettingsActionIcon icon="x" label="Close manage reviews" onClick={onClose} />
		</div>

		<form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-2 rounded-card border border-line bg-canvas-soft p-4">
		  <label className="flex flex-col gap-1.5 text-sm">
			<span className="font-medium text-ink">Patient Name *</span>
			<input type="text" value={patientName} disabled={isSaving} onChange={(e) => setPatientName(e.target.value)} className={inputClasses} placeholder="e.g. Surendhar" />
		  </label>

		  <label className="flex flex-col gap-1.5 text-sm">
			<span className="font-medium text-ink">Review *</span>
			<textarea value={reviewText} disabled={isSaving} onChange={(e) => setReviewText(e.target.value)} className={inputClasses} rows={3} />
		  </label>

		  <div className="grid grid-cols-2 gap-2">
			<label className="flex flex-col gap-1.5 text-sm">
			  <span className="font-medium text-ink">Rating (1–5)</span>
			  <input type="number" min={1} max={5} value={rating} disabled={isSaving} onChange={(e) => setRating(Number(e.target.value))} className={inputClasses} />
			</label>
			<label className="flex flex-col gap-1.5 text-sm">
			  <span className="font-medium text-ink">Source</span>
			  <input type="text" value={source} disabled={isSaving} onChange={(e) => setSource(e.target.value)} className={inputClasses} />
			</label>
		  </div>

		  <label className="flex flex-col gap-1.5 text-sm">
			<span className="font-medium text-ink">Display order</span>
			<input
			  type="number"
			  min={1}
			  value={sortOrder}
			  disabled={isSaving}
			  onChange={(e) => setSortOrder(Number(e.target.value) || 100)}
			  className={inputClasses}
			/>
		  </label>

		  {formError ? <p className="text-xs text-red-600">{formError}</p> : null}

		  <div className="flex justify-end">
			<button type="submit" disabled={isSaving} className="inline-flex items-center justify-center rounded-full bg-blue-900 px-5 py-2.5 text-sm font-semibold text-canvas transition-colors hover:bg-blue-800">
			  {isSaving ? "Adding…" : "+ Add Review"}
			</button>
		  </div>
		</form>

		<div className="mt-4">
		  {isLoading ? (
			<div className="rounded-card border border-line bg-canvas-soft p-6 text-center text-sm text-ink/60">Loading reviews…</div>
		  ) : loadError ? (
			<div className="flex flex-col items-center gap-3 rounded-card border border-line bg-canvas-soft p-6 text-center">
			  <p className="text-sm text-red-600">Couldn't load reviews right now.
				{loadErrorMessage ? <span className="mt-1 block font-mono text-xs text-red-500">{loadErrorMessage}</span> : null}
			  </p>
			  {onRetry ? (
				<button type="button" onClick={onRetry} className="inline-flex items-center justify-center rounded-full bg-blue-900 px-4 py-1.5 text-xs font-semibold text-canvas transition-colors hover:bg-blue-800">Retry</button>
			  ) : null}
			</div>
		  ) : testimonials.length === 0 ? (
			<div className="rounded-card border border-line bg-canvas-soft p-6 text-center text-sm text-ink/60">No reviews added yet.</div>
		  ) : (
			<ul className="flex max-h-80 flex-col gap-2 overflow-y-auto">
			  {testimonials.map((t) => {
				const isBusy = busyId === t.id;
				const isEditing = editingId === t.id;
				return (
				  <li key={t.id} className="flex flex-col gap-2 rounded-card border border-line bg-canvas p-3">
					<div className="flex items-start justify-between gap-2">
					  <div className="flex-1">
						<div className="flex items-center gap-3">
						  <span className="font-medium text-ink">{t.patient_name}</span>
						  <span className="text-sm text-ink/60">· {t.source}</span>
						</div>
						<p className="mt-2 text-sm text-ink/80">{t.review_text}</p>
						<div className="mt-2 text-sm text-ink/70">{Array.from({ length: t.rating }).map((_, i) => (<span key={i}>★</span>))}</div>
					  </div>
					  <div className="flex flex-none flex-col items-end gap-2">
						{isEditing ? (
						  <div className="flex items-center gap-2">
							<button type="button" onClick={() => { if (editingDraft) { onUpdate({ ...t, ...editingDraft } as AdminTestimonial); setEditingId(null); setEditingDraft(null); } }} disabled={isBusy} className="inline-flex items-center justify-center rounded-full bg-blue-900 px-3 py-1.5 text-xs font-semibold text-canvas">Save</button>
							<button type="button" onClick={() => { setEditingId(null); setEditingDraft(null); }} disabled={isBusy} className="inline-flex items-center justify-center rounded-full border border-line px-3 py-1.5 text-xs font-semibold text-ink">Cancel</button>
						  </div>
						) : (
						  <div className="flex flex-col items-end gap-2">
							<div className="flex flex-col items-end gap-2">
															<SettingsActionIcon icon="edit" label={`Edit review by ${t.patient_name}`} onClick={() => { setEditingId(t.id); setEditingDraft(t); }} disabled={isBusy} tone="neutral" />
															<SettingsActionIcon icon="trash" label={`Remove review by ${t.patient_name}`} onClick={() => onRemove(t)} disabled={isBusy} tone="danger" />
							  {onToggleActive ? (
																<SettingsActionIcon icon={t.is_active ? "eye-off" : "eye"} label={t.is_active ? `Disable review by ${t.patient_name}` : `Enable review by ${t.patient_name}`} onClick={() => onToggleActive(t)} disabled={isBusy} tone={t.is_active ? "warning" : "success"} />
							  ) : null}
							</div>
						  </div>
						)}
					  </div>
					</div>
					{isEditing && editingDraft ? (
					  <div className="mt-2 grid grid-cols-1 gap-2">
						<input value={(editingDraft.patient_name ?? "") as string} onChange={(e) => setEditingDraft({ ...editingDraft, patient_name: e.target.value })} className={inputClasses} />
						<textarea value={(editingDraft.review_text ?? "") as string} onChange={(e) => setEditingDraft({ ...editingDraft, review_text: e.target.value })} className={inputClasses} rows={3} />
						<input type="number" min={1} max={5} value={(editingDraft.rating ?? 5) as number} onChange={(e) => setEditingDraft({ ...editingDraft, rating: Number(e.target.value) })} className={inputClasses} />
						<input value={(editingDraft.source ?? "") as string} onChange={(e) => setEditingDraft({ ...editingDraft, source: e.target.value })} className={inputClasses} />
					  </div>
					) : null}
				  </li>
				);
			  })}
			</ul>
		  )}
		</div>

		<div className="mt-6 flex justify-end">
		  <button
			type="button"
			onClick={onClose}
			className="inline-flex items-center justify-center rounded-full bg-blue-900 px-5 py-2.5 text-sm font-semibold text-canvas transition-colors hover:bg-blue-800"
		  >
			Close
		  </button>
		</div>
	  </div>
	</div>
  );
}
