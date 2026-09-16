export const ADMIN_THEME_KEY = "spm-admin-theme";
export const ADMIN_DARK_MODE_KEY = "spm-admin-dark-mode";

export const ADMIN_THEMES = [
  { key: "soft-blue", name: "Soft Blue", color: "#F1F6FA" },
  { key: "soft-mint", name: "Soft Mint", color: "#F1F8F5" },
  { key: "soft-lavender", name: "Soft Lavender", color: "#F5F2FA" },
  { key: "cool-gray", name: "Cool Gray", color: "#F4F6F8" },
  { key: "soft-rose", name: "Soft Rose", color: "#FAF3F4" },
] as const;

export type AdminThemeKey = (typeof ADMIN_THEMES)[number]["key"];

export function getDefaultAdminTheme(): AdminThemeKey {
  return "soft-blue";
}

export function getStoredAdminTheme(): AdminThemeKey {
  if (typeof window === "undefined") {
    return getDefaultAdminTheme();
  }

  const storedTheme = window.localStorage.getItem(ADMIN_THEME_KEY);
  return ADMIN_THEMES.some((theme) => theme.key === storedTheme)
    ? (storedTheme as AdminThemeKey)
    : getDefaultAdminTheme();
}

export function getStoredAdminDarkMode(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  return window.localStorage.getItem(ADMIN_DARK_MODE_KEY) === "true";
}

export function applyAdminTheme(theme: AdminThemeKey, darkMode = false) {
  if (typeof document === "undefined") {
    return;
  }

  document.body.dataset.adminTheme = theme;
  document.documentElement.dataset.adminTheme = theme;
  document.body.dataset.adminDarkMode = darkMode ? "true" : "false";
  document.documentElement.dataset.adminDarkMode = darkMode ? "true" : "false";

  if (typeof window !== "undefined") {
    window.localStorage.setItem(ADMIN_THEME_KEY, theme);
    window.localStorage.setItem(ADMIN_DARK_MODE_KEY, String(darkMode));
  }
}
