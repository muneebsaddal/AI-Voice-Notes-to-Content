import type { Theme } from "../types";

export const darkTheme: Theme = {
  name: "dark",
  colors: {
    background: "#15171B",
    foreground: "#F5F7FA",
    mutedForeground: "#A5ACB8",
    surface: "#202329",
    surfaceElevated: "#282C34",
    popover: "#242830",
    secondary: "#303641",
    secondaryForeground: "#F5F7FA",
    border: "rgba(255,255,255,0.11)",
    listen: "#0A84FF",
    listenSoft: "rgba(10,132,255,0.18)",
    destructive: "#FF453A",
    success: "#34C759",
    backdrop: "rgba(0,0,0,0.48)",
    shadow: "#000000",
    white: "#FFFFFF",
  },
};

export const lightTheme: Theme = {
  name: "light",
  colors: {
    background: "#F7F8FA",
    foreground: "#17191D",
    mutedForeground: "#657080",
    surface: "#FFFFFF",
    surfaceElevated: "#F0F2F5",
    popover: "#FFFFFF",
    secondary: "#ECEFF3",
    secondaryForeground: "#1D2026",
    border: "rgba(19,24,33,0.11)",
    listen: "#007AFF",
    listenSoft: "rgba(0,122,255,0.12)",
    destructive: "#FF3B30",
    success: "#34C759",
    backdrop: "rgba(0,0,0,0.28)",
    shadow: "#9AA3AF",
    white: "#FFFFFF",
  },
};

export const spacing = {
  screenX: 24,
  headerHeight: 56,
  footerHeight: 118,
  radius: 22,
};

export const typography = {
  title: 28,
  heading: 22,
  body: 17,
  secondary: 15,
  caption: 12,
};

export const fonts = {
  regular: "Geist_400Regular",
  medium: "Geist_500Medium",
  semiBold: "Geist_600SemiBold",
  bold: "Geist_700Bold",
  extraBold: "Geist_800ExtraBold",
  black: "Geist_900Black",
};
