export type OutputType = "note" | "todo" | "email" | "journal" | "content";

export type GeneratedOutput = {
  id: string;
  outputType: OutputType;
  title: string;
  body: string;
  preview: string;
  createdAtLabel: string;
};

export type Theme = {
  name: "dark" | "light";
  colors: {
    background: string;
    foreground: string;
    mutedForeground: string;
    surface: string;
    surfaceElevated: string;
    popover: string;
    secondary: string;
    secondaryForeground: string;
    border: string;
    listen: string;
    listenSoft: string;
    destructive: string;
    success: string;
    backdrop: string;
    shadow: string;
    white: string;
  };
};
