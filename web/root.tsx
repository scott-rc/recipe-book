import { Provider as GadgetProvider } from "@gadgetinc/react";
import { DevelopmentErrorBoundary, ProductionErrorBoundary } from "gadget-server/react-router";
import { Suspense } from "react";
import { Links, Outlet, Scripts, ScrollRestoration, useNavigate } from "react-router";
import { api } from "./api";
import "./app.css";

export default function App() {
  const navigate = useNavigate();

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.svg" sizes="any" type="image/svg+xml" />
        <title>Recipe Book</title>
        <Links />
      </head>
      <body>
        <Suspense fallback={<div className="h-screen w-screen animate-pulse bg-gray-100" />}>
          <GadgetProvider api={api} navigate={(path) => void navigate(path)}>
            <Outlet />
          </GadgetProvider>
          <ScrollRestoration />
          <Scripts />
        </Suspense>
      </body>
    </html>
  );
}

// Default Gadget error boundary component
// This can be replaced with your own custom error boundary implementation
// For more info, checkout https://reactrouter.com/how-to/error-boundary#1-add-a-root-error-boundary
export const ErrorBoundary = process.env.NODE_ENV === "production" ? ProductionErrorBoundary : DevelopmentErrorBoundary;
