import { BookOpenIcon, CloudDownloadIcon } from "lucide-react";
import { Link, Outlet, redirect } from "react-router";
import { api } from "../api";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Button } from "../components/ui/button";
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

export interface AuthOutletContext {
  session: Route.ComponentProps["loaderData"]["session"];
  user: Route.ComponentProps["loaderData"]["user"];
}

export default function ({ loaderData: { session, user } }: Route.ComponentProps) {
  return (
    <div className="relative isolate mx-auto flex h-svh min-h-svh w-full max-w-6xl flex-col bg-white px-4 pt-8 pb-32 max-lg:flex-col">
      <header className="mb-8 flex items-center justify-between rounded-lg px-4 pt-2">
        <h1 className="text-2xl font-bold">
          <Link to="/" className="flex items-center gap-x-2 transition-colors" viewTransition>
            <BookOpenIcon className="h-6 w-6" />
            <span className="hidden md:block">Recipe Book</span>
          </Link>
        </h1>
        <div className="flex items-center gap-x-5 text-xl">
          <Button asChild variant="outline">
            <Link to="/import" viewTransition>
              <CloudDownloadIcon className="h-4 w-4" />
              <span className="hidden md:block">Import</span>
            </Link>
          </Button>
          <Link to="/" className="transition-opacity hover:opacity-80" viewTransition>
            <Avatar>
              <AvatarImage src={user.googleImageUrl ?? "https://assets.gadget.dev/assets/default-app-assets/default-user-icon.svg"} />
              <AvatarFallback>{(user.firstName ?? user.email).charAt(0)}</AvatarFallback>
            </Avatar>
          </Link>
        </div>
      </header>
      <main className="flex-1">
        <Outlet context={{ session, user } as AuthOutletContext} />
      </main>
    </div>
  );
}
