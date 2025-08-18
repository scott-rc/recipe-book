import { Link, Outlet, redirect, useOutletContext } from "react-router";
import { api } from "../api";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import type { RootOutletContext } from "../root";
import type { Route } from "./+types/_app";

export async function clientLoader() {
  const session = await api.currentSession.get({
    select: {
      id: true,
      userId: true,
      createdAt: true,
      updatedAt: true,
      user: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        googleImageUrl: true,
        createdAt: true,
        updatedAt: true,
      },
    },
  });

  if (!session.user) {
    return redirect("/sign-in");
  }

  return { session, user: session.user };
}

export type AuthOutletContext = RootOutletContext & {
  session: Route.ComponentProps["loaderData"]["session"];
  user: Route.ComponentProps["loaderData"]["user"];
};

export default function ({ loaderData: { session, user } }: Route.ComponentProps) {
  const rootOutletContext = useOutletContext<RootOutletContext>();

  return (
    <div className="h-100dvh px-3">
      <header className="flex h-1/10 items-center justify-between pt-2">
        <h1 className="text-2xl font-bold">
          <Link to="/">Recipes</Link>
        </h1>
        <div className="flex items-center gap-x-5">
          <Link to="/import">Import</Link>
          <Link to="/">
            <Avatar>
              <AvatarImage src={user.googleImageUrl ?? "https://assets.gadget.dev/assets/default-app-assets/default-user-icon.svg"} />
              <AvatarFallback>{(user.firstName ?? user.email).charAt(0)}</AvatarFallback>
            </Avatar>
          </Link>
        </div>
      </header>
      <main className="h-9/10">
        <Outlet context={{ ...rootOutletContext, session, user } as AuthOutletContext} />
      </main>
    </div>
  );
}
