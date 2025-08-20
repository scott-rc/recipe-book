import { Outlet, redirect } from "react-router";
import { api } from "../api";

export async function clientLoader() {
  const session = await api.currentSession.get({ select: { user: { id: true } } });
  if (session.user) {
    return redirect("/");
  }
  return {};
}

export default function () {
  return (
    <div className="grid h-dvh w-dvw place-items-center">
      <Outlet />
    </div>
  );
}
