import { useContext } from "react"
import { ThemeContext, type ThemeContextType } from "@/lib/ThemeContext"

/** Hook to get and set the active theme. */
export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }

  return context;
}