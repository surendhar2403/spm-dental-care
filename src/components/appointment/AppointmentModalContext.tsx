"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

interface AppointmentModalContextValue {
  isOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
}

const AppointmentModalContext = createContext<AppointmentModalContextValue | null>(
  null,
);

/**
 * Shares "is the Book Appointment modal open" state across the whole app
 * (Header, Hero, the Contact section, etc. all trigger the same modal)
 * without prop-drilling through every layout piece.
 */
export function AppointmentModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const openModal = useCallback(() => setIsOpen(true), []);
  const closeModal = useCallback(() => setIsOpen(false), []);

  const value = useMemo(
    () => ({ isOpen, openModal, closeModal }),
    [isOpen, openModal, closeModal],
  );

  return (
    <AppointmentModalContext.Provider value={value}>
      {children}
    </AppointmentModalContext.Provider>
  );
}

export function useAppointmentModal(): AppointmentModalContextValue {
  const context = useContext(AppointmentModalContext);
  if (!context) {
    throw new Error(
      "useAppointmentModal must be used within an AppointmentModalProvider",
    );
  }
  return context;
}
