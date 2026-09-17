export interface NavLink {
  label: string;
  href: string;
}

export interface Treatment {
  id: string;
  name: string;
  description: string;
  price?: number | null;
}

/**
 * Row shape read from public.treatments by the PUBLIC appointment form's
 * treatment dropdown (see AppointmentForm.tsx). Deliberately minimal —
 * only what the dropdown needs to render an <option> — unlike the
 * admin-only AdminTreatment type (src/types/admin.ts), which also carries
 * is_active/sort_order/created_at for the management UI. The public query
 * already filters to is_active = true and orders server-side, so those
 * fields aren't needed here.
 */
export interface BookingTreatment {
  id: string;
  name: string;
  price?: number | null;
}

/**
 * Row shape read from public.doctors by the PUBLIC "Our Dental Specialists"
 * section (see components/sections/Dentist.tsx). Mirrors BookingTreatment
 * above — deliberately minimal, only what the public card grid renders —
 * unlike the admin-only Doctor type (src/types/admin.ts), which also
 * carries is_active/sort_order/created_at for the management UI. The
 * public query already filters to is_active = true and orders
 * server-side, so those fields aren't needed here.
 */
export interface PublicDoctor {
  id: string;
  name: string;
  credentials: string | null;
  specialty: string | null;
  description: string | null;
  experience: number | null;
}

export interface ClinicSettings {
  id: string;
  clinic_name: string;
  location_heading: string;
  location_subtitle: string | null;
  business_name: string | null;
  address_line_1: string | null;
  address_line_2: string | null;
  city: string | null;
  state: string | null;
  pincode: string | null;
  country: string | null;
  map_url: string | null;
  latitude: number | null;
  longitude: number | null;
  contact_number: string | null;
  opening_hours: string | null;
  created_at: string;
  updated_at: string;
}

export interface ClinicGalleryImage {
  id: string;
  title: string | null;
  image_url: string;
  storage_path: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ClinicValue {
  title: string;
  description: string;
}

export interface ContactDetails {
  phone: string;
  whatsapp: string;
  email?: string;
  addressLines: string[];
  locatedIn?: string;
  hours: { day: string; time: string }[];
  mapsUrl: string;
}

/** Public testimonial row read by the public site (public.testimonials). */
export interface PublicTestimonial {
  id?: string;
  patient_name: string;
  review_text: string;
  rating: number;
  source: string;
  is_active?: boolean;
  sort_order?: number | null;
  created_at: string;
}

