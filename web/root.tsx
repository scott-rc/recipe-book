import { Provider as GadgetProvider } from "@gadgetinc/react";
import type { GadgetConfig } from "gadget-server";
import { DevelopmentErrorBoundary, ProductionErrorBoundary } from "gadget-server/react-router";
import { Suspense } from "react";
import { Links, Outlet, Scripts, ScrollRestoration, useNavigate } from "react-router";
import type { Route } from "./+types/root";
import { api } from "./api";
import "./app.css";
import { ThemeProvider } from "./components/theme-provider";

export interface RootOutletContext {
  gadgetConfig: GadgetConfig;
}

export function loader({ context }: Route.LoaderArgs) {
  return {
    gadgetConfig: context.gadgetConfig,
  };
}

export default function App({ loaderData: { gadgetConfig } }: Route.ComponentProps) {
  const navigate = useNavigate();

  return (
    <html lang="en" className="light">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Recipe Book</title>
        <Links />
      </head>
      <body>
        <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
          <Suspense fallback={<div className="h-screen w-screen animate-pulse bg-gray-100" />}>
            <GadgetProvider api={api} navigate={(path) => void navigate(path)} auth={gadgetConfig.authentication}>
              <Outlet context={{ gadgetConfig } as RootOutletContext} />
            </GadgetProvider>
            <ScrollRestoration />
            <Scripts />
          </Suspense>
        </ThemeProvider>
      </body>
    </html>
  );
}

// Default Gadget error boundary component
// This can be replaced with your own custom error boundary implementation
// For more info, checkout https://reactrouter.com/how-to/error-boundary#1-add-a-root-error-boundary
export const ErrorBoundary = process.env.NODE_ENV === "production" ? ProductionErrorBoundary : DevelopmentErrorBoundary;
