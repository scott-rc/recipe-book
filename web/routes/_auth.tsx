import { Outlet, redirect, useOutletContext } from "react-router";
import { api } from "../api";
import type { RootOutletContext } from "../root";

export async function clientLoader() {
  const session = await api.currentSession.get({ select: { user: { id: true } } });
  if (session.user) {
    return redirect("/");
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
