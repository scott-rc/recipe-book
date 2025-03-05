import { createContext, useContext } from "react";

export interface UseThemeSwitcherProps {
  theme: "light" | "dark";
  setTheme: React.Dispatch<React.SetStateAction<"light" | "dark">>;
}

export const ThemeSwitcherContext = createContext<UseThemeSwitcherProps | undefined>(undefined);

export function useThemeSwitcher() {
  return useContext(ThemeSwitcherContext) ?? { theme: "light", setTheme: (_) => {} };
}
