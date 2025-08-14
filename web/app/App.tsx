import { Provider as GadgetProvider } from "@gadgetinc/react";
import { Suspense, type ReactElement } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { api } from "../api";
import { ThemeProvider } from "../components/theme-provider";
import { ForgotPassword } from "./auth/ForgotPassword";
import { ResetPassword } from "./auth/ResetPassword";
import { SignedIn } from "./auth/SignedIn";
import { SignIn } from "./auth/SignIn";
import { SignUp } from "./auth/SignUp";
import { VerifyEmail } from "./auth/VerifyEmail";
import { Root } from "./Root";

const router = createBrowserRouter([
  Root.route,
  ForgotPassword.route,
  ResetPassword.route,
  SignUp.route,
  SignIn.route,
  SignedIn.route,
  VerifyEmail.route,
]);

export function App(): ReactElement {
  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <Suspense fallback={<div className="h-screen w-screen animate-pulse bg-gray-100" />}>
        <GadgetProvider api={api} navigate={(path) => void router.navigate(path)} auth={window.gadgetConfig.authentication}>
          <RouterProvider router={router} />
        </GadgetProvider>
      </Suspense>
    </ThemeProvider>
  );
}
