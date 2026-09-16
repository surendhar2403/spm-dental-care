"use client";

import { useEffect, useState, type ChangeEvent } from "react";
import type { ClinicGalleryImage, ClinicSettings } from "@/types";

interface ManageClinicInfoModalProps {
  settings: ClinicSettings | null;
  galleryImages: ClinicGalleryImage[];
  isLoading: boolean;
  isSaving: boolean;
  busyId: string | null;
  onClose: () => void;
  onSaveSettings: (values: Record<string, string | number | null>) => void;
  onAddGalleryImage: (file: File, title?: string) => void;
  onReplaceGalleryImage: (image: ClinicGalleryImage, file: File) => void;
  onRemoveGalleryImage: (image: ClinicGalleryImage) => void;
  onReorderGalleryImage: (image: ClinicGalleryImage, direction: "up" | "down") => void;
  onToggleGalleryImageActive: (image: ClinicGalleryImage) => void;
}

const inputClasses =
  "w-full rounded-lg border border-line bg-canvas px-3 py-2 text-sm text-ink placeholder:text-ink/40 focus:border-blue-600 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60";

const EMPTY_SETTINGS = {
  clinic_name: "SPM Dental Care",
  location_heading: "Find us in Kumananchavadi",
  location_subtitle: "Located in Shalom Enterprises",
  business_name: "Shalom Enterprises",
  address_line_1: "24W8+428, Trunk Rd, MSS Nagar,",
  address_line_2: "Kumananchavadi, Poonamallee, Kattupakkam,",
  city: "Chennai",
  state: "Tamil Nadu",
  pincode: "600056",
  country: "India",
  map_url: "https://maps.app.goo.gl/EwTgAWer4MD6tK6EA",
  latitude: 13.0499,
  longitude: 80.1628,
  contact_number: "8838524738",
  opening_hours: "Monday – Sunday: 9:00 AM – 9:00 PM",
};

export default function ManageClinicInfoModal({
  settings,
  galleryImages,
  isLoading,
  isSaving,
  busyId,
  onClose,
  onSaveSettings,
  onAddGalleryImage,
  onReplaceGalleryImage,
  onRemoveGalleryImage,
  onReorderGalleryImage,
  onToggleGalleryImageActive,
}: ManageClinicInfoModalProps) {
  const [formValues, setFormValues] = useState<Record<string, string | number | null>>(EMPTY_SETTINGS);
  const [addingImageId, setAddingImageId] = useState<string | null>(null);
  const [galleryTitle, setGalleryTitle] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  useEffect(() => {
    if (!settings) {
      setFormValues(EMPTY_SETTINGS);
      return;
    }

    setFormValues({
      clinic_name: settings.clinic_name ?? EMPTY_SETTINGS.clinic_name,
      location_heading: settings.location_heading ?? EMPTY_SETTINGS.location_heading,
      location_subtitle: settings.location_subtitle ?? EMPTY_SETTINGS.location_subtitle,
      business_name: settings.business_name ?? EMPTY_SETTINGS.business_name,
      address_line_1: settings.address_line_1 ?? EMPTY_SETTINGS.address_line_1,
      address_line_2: settings.address_line_2 ?? EMPTY_SETTINGS.address_line_2,
      city: settings.city ?? EMPTY_SETTINGS.city,
      state: settings.state ?? EMPTY_SETTINGS.state,
      pincode: settings.pincode ?? EMPTY_SETTINGS.pincode,
      country: settings.country ?? EMPTY_SETTINGS.country,
      map_url: settings.map_url ?? EMPTY_SETTINGS.map_url,
      latitude: settings.latitude ?? EMPTY_SETTINGS.latitude,
      longitude: settings.longitude ?? EMPTY_SETTINGS.longitude,
      contact_number: settings.contact_number ?? EMPTY_SETTINGS.contact_number,
      opening_hours: settings.opening_hours ?? EMPTY_SETTINGS.opening_hours,
    });
  }, [settings]);

  function updateField(field: string, value: string | number | null) {
    setFormValues((current) => ({ ...current, [field]: value }));
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (isSaving) return;

    const contactNumber = String(formValues.contact_number ?? "").trim();
    const mapUrl = String(formValues.map_url ?? "").trim();
    const latitude = Number(formValues.latitude);
    const longitude = Number(formValues.longitude);

    if (!String(formValues.clinic_name ?? "").trim()) {
      setFormError("Clinic name is required.");
      return;
    }
    if (!String(formValues.location_heading ?? "").trim()) {
      setFormError("Location heading is required.");
      return;
    }
    if (contactNumber && !/^\+?[0-9\s()-]{7,20}$/.test(contactNumber)) {
      setFormError("Please enter a valid contact number.");
      return;
    }
    if (mapUrl && !/^https?:\/\//i.test(mapUrl) && !mapUrl.startsWith("www.")) {
      setFormError("Map URL must start with http:// or https://.");
      return;
    }
    if ((formValues.latitude !== null && formValues.latitude !== undefined && Number.isNaN(latitude)) || (formValues.longitude !== null && formValues.longitude !== undefined && Number.isNaN(longitude))) {
      setFormError("Latitude and longitude must be numeric values.");
      return;
    }

    setFormError(null);
    onSaveSettings(formValues);
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>, image?: ClinicGalleryImage) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (image) {
      onReplaceGalleryImage(image, file);
    } else {
      onAddGalleryImage(file, galleryTitle.trim() || undefined);
    }

    event.target.value = "";
    setGalleryTitle("");
    setAddingImageId(null);
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="manage-clinic-info-heading"
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-ink/40 px-4 py-8"
      onClick={onClose}
    >
      <div
        className="w-full max-w-5xl rounded-card border border-line bg-canvas p-4 sm:p-6"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="manage-clinic-info-heading" className="font-display text-lg text-ink">
              Manage Clinic Information
            </h2>
            <p className="mt-1 text-sm text-ink/60">
              Update the clinic gallery, contact details, location, and opening hours.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex-none text-ink/50 transition-colors hover:text-ink"
          >
            ✕
          </button>
        </div>

        {isLoading ? (
          <div className="mt-4 rounded-card border border-line bg-canvas-soft p-8 text-center text-sm text-ink/60">
            Loading clinic information…
          </div>
        ) : (
          <div className="mt-4 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
            <form onSubmit={handleSubmit} className="space-y-4 rounded-card border border-line bg-canvas-soft p-4">
              <div className="flex items-center justify-between gap-3 border-b border-line pb-2">
                <h3 className="font-display text-base text-ink">Clinic Location</h3>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <label className="flex flex-col gap-1.5 text-sm sm:col-span-2">
                  <span className="font-medium text-ink">Clinic name</span>
                  <input
                    type="text"
                    value={String(formValues.clinic_name ?? "")}
                    disabled={isSaving}
                    onChange={(event) => updateField("clinic_name", event.target.value)}
                    className={inputClasses}
                  />
                </label>

                <label className="flex flex-col gap-1.5 text-sm sm:col-span-2">
                  <span className="font-medium text-ink">Location heading</span>
                  <input
                    type="text"
                    value={String(formValues.location_heading ?? "")}
                    disabled={isSaving}
                    onChange={(event) => updateField("location_heading", event.target.value)}
                    className={inputClasses}
                  />
                </label>

                <label className="flex flex-col gap-1.5 text-sm sm:col-span-2">
                  <span className="font-medium text-ink">Location subtitle</span>
                  <input
                    type="text"
                    value={String(formValues.location_subtitle ?? "")}
                    disabled={isSaving}
                    onChange={(event) => updateField("location_subtitle", event.target.value)}
                    className={inputClasses}
                  />
                </label>

                <label className="flex flex-col gap-1.5 text-sm sm:col-span-2">
                  <span className="font-medium text-ink">Business name</span>
                  <input
                    type="text"
                    value={String(formValues.business_name ?? "")}
                    disabled={isSaving}
                    onChange={(event) => updateField("business_name", event.target.value)}
                    className={inputClasses}
                  />
                </label>

                <label className="flex flex-col gap-1.5 text-sm sm:col-span-2">
                  <span className="font-medium text-ink">Address line 1</span>
                  <input
                    type="text"
                    value={String(formValues.address_line_1 ?? "")}
                    disabled={isSaving}
                    onChange={(event) => updateField("address_line_1", event.target.value)}
                    className={inputClasses}
                  />
                </label>

                <label className="flex flex-col gap-1.5 text-sm sm:col-span-2">
                  <span className="font-medium text-ink">Address line 2</span>
                  <input
                    type="text"
                    value={String(formValues.address_line_2 ?? "")}
                    disabled={isSaving}
                    onChange={(event) => updateField("address_line_2", event.target.value)}
                    className={inputClasses}
                  />
                </label>

                <label className="flex flex-col gap-1.5 text-sm">
                  <span className="font-medium text-ink">City</span>
                  <input
                    type="text"
                    value={String(formValues.city ?? "")}
                    disabled={isSaving}
                    onChange={(event) => updateField("city", event.target.value)}
                    className={inputClasses}
                  />
                </label>

                <label className="flex flex-col gap-1.5 text-sm">
                  <span className="font-medium text-ink">State</span>
                  <input
                    type="text"
                    value={String(formValues.state ?? "")}
                    disabled={isSaving}
                    onChange={(event) => updateField("state", event.target.value)}
                    className={inputClasses}
                  />
                </label>

                <label className="flex flex-col gap-1.5 text-sm">
                  <span className="font-medium text-ink">Pincode</span>
                  <input
                    type="text"
                    value={String(formValues.pincode ?? "")}
                    disabled={isSaving}
                    onChange={(event) => updateField("pincode", event.target.value)}
                    className={inputClasses}
                  />
                </label>

                <label className="flex flex-col gap-1.5 text-sm">
                  <span className="font-medium text-ink">Country</span>
                  <input
                    type="text"
                    value={String(formValues.country ?? "")}
                    disabled={isSaving}
                    onChange={(event) => updateField("country", event.target.value)}
                    className={inputClasses}
                  />
                </label>

                <label className="flex flex-col gap-1.5 text-sm sm:col-span-2">
                  <span className="font-medium text-ink">Map URL</span>
                  <input
                    type="url"
                    value={String(formValues.map_url ?? "")}
                    disabled={isSaving}
                    onChange={(event) => updateField("map_url", event.target.value)}
                    className={inputClasses}
                  />
                </label>

                <label className="flex flex-col gap-1.5 text-sm">
                  <span className="font-medium text-ink">Latitude</span>
                  <input
                    type="number"
                    step="any"
                    value={String(formValues.latitude ?? "")}
                    disabled={isSaving}
                    onChange={(event) => updateField("latitude", event.target.value ? Number(event.target.value) : null)}
                    className={inputClasses}
                  />
                </label>

                <label className="flex flex-col gap-1.5 text-sm">
                  <span className="font-medium text-ink">Longitude</span>
                  <input
                    type="number"
                    step="any"
                    value={String(formValues.longitude ?? "")}
                    disabled={isSaving}
                    onChange={(event) => updateField("longitude", event.target.value ? Number(event.target.value) : null)}
                    className={inputClasses}
                  />
                </label>

                <label className="flex flex-col gap-1.5 text-sm">
                  <span className="font-medium text-ink">Contact number</span>
                  <input
                    type="text"
                    value={String(formValues.contact_number ?? "")}
                    disabled={isSaving}
                    onChange={(event) => updateField("contact_number", event.target.value)}
                    className={inputClasses}
                  />
                </label>

                <label className="flex flex-col gap-1.5 text-sm sm:col-span-2">
                  <span className="font-medium text-ink">Opening hours</span>
                  <input
                    type="text"
                    value={String(formValues.opening_hours ?? "")}
                    disabled={isSaving}
                    onChange={(event) => updateField("opening_hours", event.target.value)}
                    className={inputClasses}
                  />
                </label>
              </div>

              {formError ? <p className="text-xs text-red-600">{formError}</p> : null}

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="inline-flex items-center justify-center rounded-full border border-line px-4 py-2 text-sm font-medium text-ink transition-colors hover:bg-canvas"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex items-center justify-center rounded-full bg-blue-900 px-5 py-2.5 text-sm font-semibold text-canvas transition-colors hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSaving ? "Saving…" : "Save Clinic Information"}
                </button>
              </div>
            </form>

            <div className="space-y-4 rounded-card border border-line bg-canvas-soft p-4">
              <div className="flex items-center justify-between gap-3 border-b border-line pb-2">
                <h3 className="font-display text-base text-ink">Gallery Images</h3>
              </div>

              <div className="flex flex-col gap-2">
                <label className="flex flex-col gap-1.5 text-sm">
                  <span className="font-medium text-ink">Optional title</span>
                  <input
                    type="text"
                    value={galleryTitle}
                    disabled={isSaving}
                    onChange={(event) => setGalleryTitle(event.target.value)}
                    className={inputClasses}
                    placeholder="e.g. Reception area"
                  />
                </label>

                <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-full bg-blue-900 px-4 py-2 text-sm font-semibold text-canvas transition-colors hover:bg-blue-800">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={isSaving}
                    onChange={(event) => handleFileChange(event)}
                  />
                  + Add image
                </label>
              </div>

              {galleryImages.length === 0 ? (
                <div className="rounded-card border border-dashed border-line bg-canvas p-4 text-center text-sm text-ink/60">
                  No gallery images yet.
                </div>
              ) : (
                <ul className="flex max-h-[26rem] flex-col gap-3 overflow-y-auto pr-1">
                  {galleryImages.map((image) => {
                    const isBusy = busyId === image.id;
                    const isConfirming = confirmingId === image.id;

                    return (
                      <li key={image.id} className="rounded-card border border-line bg-canvas p-2">
                        <div className="flex gap-3">
                          <div className="relative h-20 w-20 flex-none overflow-hidden rounded-md border border-line bg-canvas-soft">
                            <img src={image.image_url} alt={image.title ?? "Clinic gallery image"} className="h-full w-full object-cover" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-ink">{image.title || "Untitled image"}</p>
                            <p className="text-xs text-ink/60">Order: {image.sort_order}</p>
                            <div className="mt-2 flex flex-wrap gap-2">
                              <button
                                type="button"
                                onClick={() => onReorderGalleryImage(image, "up")}
                                disabled={isBusy || isSaving}
                                className="rounded-full border border-line px-2 py-1 text-[10px] font-medium text-ink transition-colors hover:bg-canvas-soft disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                ↑
                              </button>
                              <button
                                type="button"
                                onClick={() => onReorderGalleryImage(image, "down")}
                                disabled={isBusy || isSaving}
                                className="rounded-full border border-line px-2 py-1 text-[10px] font-medium text-ink transition-colors hover:bg-canvas-soft disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                ↓
                              </button>
                              <label className="cursor-pointer rounded-full border border-line px-2 py-1 text-[10px] font-medium text-ink transition-colors hover:bg-canvas-soft disabled:cursor-not-allowed disabled:opacity-60">
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  disabled={isBusy || isSaving}
                                  onChange={(event) => {
                                    handleFileChange(event, image);
                                  }}
                                />
                                Replace
                              </label>
                              <button
                                type="button"
                                onClick={() => onToggleGalleryImageActive(image)}
                                disabled={isBusy || isSaving}
                                className="rounded-full border border-line px-2 py-1 text-[10px] font-medium text-ink transition-colors hover:bg-canvas-soft disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                {image.is_active ? "Hide" : "Show"}
                              </button>
                            </div>
                          </div>
                        </div>

                        {isConfirming ? (
                          <div className="mt-3 flex flex-wrap items-center justify-end gap-2">
                            <span className="text-xs text-ink/70">Remove this image?</span>
                            <button
                              type="button"
                              disabled={isBusy || isSaving}
                              onClick={() => {
                                onRemoveGalleryImage(image);
                                setConfirmingId(null);
                              }}
                              className="inline-flex items-center justify-center rounded-full bg-red-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              {isBusy ? "Removing…" : "Yes, remove"}
                            </button>
                            <button
                              type="button"
                              disabled={isBusy || isSaving}
                              onClick={() => setConfirmingId(null)}
                              className="inline-flex items-center justify-center rounded-full border border-line px-3 py-1.5 text-xs font-semibold text-ink transition-colors hover:bg-canvas-soft disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div className="mt-3 flex justify-end">
                            <button
                              type="button"
                              onClick={() => setConfirmingId(image.id)}
                              disabled={busyId !== null || isSaving}
                              className="text-xs font-medium text-red-600 hover:underline disabled:cursor-not-allowed disabled:text-ink/40 disabled:no-underline"
                            >
                              Remove
                            </button>
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
