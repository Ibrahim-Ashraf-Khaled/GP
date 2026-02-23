export const ROUTES = {
  HOME: "/",
  BOOKINGS: "/bookings",
  PROFILE: "/profile",
  AUTH: "/auth",
  LOGIN: "/login",
  REGISTER: "/register",

  property: (id: string) => `/property/${id}`,
  booking: (id: string) => `/property/${id}/booking`,
  bookingConfirmation: (id: string) => `/property/${id}/booking/confirmation`,
} as const;
