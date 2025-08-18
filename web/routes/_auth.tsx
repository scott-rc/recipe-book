import { Outlet, redirect, useOutletContext } from "react-router";
import type { RootOutletContext } from "../root";
import type { Route } from "./+types/_auth";

export function loader({ context }: Route.LoaderArgs) {
  const signedIn = !!context.session?.get("user");
  if (signedIn) {
    return redirect(context.gadgetConfig.authentication?.redirectOnSuccessfulSignInPath ?? "/");
  }
  return {};
}

export default function () {
  const context = useOutletContext<RootOutletContext>();

  return (
    <div className="grid h-dvh w-dvw place-items-center">
      <Outlet context={context} />
    </div>
  );
}
