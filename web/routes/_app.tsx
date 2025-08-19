import { BookOpenIcon } from "lucide-react";
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
    <div className="mx-auto flex max-w-6xl flex-col gap-y-4 px-4 py-8">
      <header className="mb-2 flex h-1/10 items-center justify-between rounded-lg px-4 pt-2">
        <h1 className="text-3xl font-bold">
          <Link to="/" className="flex items-center gap-x-2 text-rose-700 transition-colors hover:text-rose-600">
            <BookOpenIcon className="h-6 w-6" />
            <span className="hidden md:block">Recipe Book</span>
          </Link>
        </h1>
        <div className="flex items-center gap-x-5">
          <Link to="/import" className="font-medium text-rose-600 transition-colors hover:text-rose-500">
            Import
          </Link>
          <Link to="/" className="transition-opacity hover:opacity-80">
            <Avatar>
              <AvatarImage src={user.googleImageUrl ?? "https://assets.gadget.dev/assets/default-app-assets/default-user-icon.svg"} />
              <AvatarFallback className="bg-rose-200 text-rose-700">{(user.firstName ?? user.email).charAt(0)}</AvatarFallback>
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
