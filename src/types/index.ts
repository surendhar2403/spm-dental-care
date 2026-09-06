export interface NavLink {
  label: string;
  href: string;
}

export interface Treatment {
  id: string;
  name: string;
  description: string;
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

