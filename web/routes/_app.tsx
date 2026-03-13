import { BookOpenIcon, CloudDownloadIcon } from "lucide-react";
import { Link, Outlet, href, redirect, useLocation, useMatches } from "react-router";

import { api } from "../api";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "../components/ui/breadcrumb";
import { Button } from "../components/ui/button";
import type { Route } from "./+types/_app";
import type { Recipe } from "./_app.r.$slug";

export async function clientLoader() {
  const session = await api.currentSession.get({
    select: {
      createdAt: true,
      id: true,
      updatedAt: true,
      user: {
        createdAt: true,
        email: true,
        firstName: true,
        googleImageUrl: true,
        id: true,
        lastName: true,
        updatedAt: true,
      },
      userId: true,
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

export default function AppRoute({ loaderData: { session, user } }: Route.ComponentProps) {
  const matches = useMatches();
  const location = useLocation();

  // Find the recipe route match to get recipe data
  const recipeMatch = matches.find((match) => match.id === "routes/_app.r.$slug");
  const recipe = recipeMatch?.loaderData as Recipe | undefined;

  // Check if we're on the edit page
  const isEditPage = location.pathname.endsWith("/edit");
  const isHomePage = location.pathname === "/";

  return (
    <div className="relative mx-auto flex h-svh min-h-svh w-full max-w-md flex-col bg-white px-4 pt-8 sm:max-w-lg md:max-w-3xl lg:max-w-4xl xl:max-w-5xl">
      <header className="mb-8 flex items-center justify-between rounded-lg">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem className="flex items-center gap-x-2">
              <BookOpenIcon className="h-5 w-5" />
              {isHomePage ? (
                <BreadcrumbPage className="text-base font-semibold">Recipe Book</BreadcrumbPage>
              ) : (
                <BreadcrumbLink to={href("/")} className="text-base font-semibold">
                  Recipe Book
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
            {recipe && (
              <>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  {isEditPage ? (
                    <BreadcrumbLink to={href("/r/:slug", { slug: recipe.slug })} className="text-base font-medium">
                      {recipe.name}
                    </BreadcrumbLink>
                  ) : (
                    <BreadcrumbPage className="text-base font-medium">{recipe.name}</BreadcrumbPage>
                  )}
                </BreadcrumbItem>
              </>
            )}
            {recipe && isEditPage && (
              <>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage className="text-base font-normal">Edit</BreadcrumbPage>
                </BreadcrumbItem>
              </>
            )}
          </BreadcrumbList>
        </Breadcrumb>
        <div className="flex items-center gap-x-5 text-xl">
          <Button asChild variant="outline">
            <Link to="/import" viewTransition>
              <CloudDownloadIcon className="h-4 w-4" />
              <span className="xs:block hidden">Import</span>
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
      <main className="flex-1 pb-32">
        <Outlet context={{ session, user } as AuthOutletContext} />
      </main>
    </div>
  );
}
