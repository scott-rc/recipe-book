// --------------------------------------------------------------------------------------
// App Layout (Logged In Pages)
// --------------------------------------------------------------------------------------
// This file defines the layout for all application routes that require the user to be authenticated (logged in).
// Typical pages using this layout include dashboards, user profile, app content, and any protected resources.
// Structure:
//   - Persistent navigation sidebar (with responsive drawer for mobile)
//   - Header with user avatar and secondary navigation
//   - Main content area for app routes (via <Outlet />)
//   - Handles redirecting logged out users to the sign-in page
// To extend: update the navigation, header, or main content area as needed for your app's logged-in experience.

import type { AvailableUserSelection, UserRecord } from "@gadget-client/recipe-book";
import { Outlet, redirect, useOutletContext } from "react-router";
import type { RootOutletContext } from "../root";
import type { Route } from "./+types/_app";

const userSelections = {
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  createdAt: true,
  updatedAt: true,
} satisfies AvailableUserSelection;

type User = ReturnType<UserRecord<typeof userSelections>["toJSON"]>;

export async function clientLoader({ context }: Route.LoaderArgs): Promise<{ user: User } | Response> {
  const userId = context.session?.get("user") as string | undefined;
  const user = userId ? await context.api.user.findOne(userId, { select: userSelections }) : undefined;
  if (!user) {
    return redirect(context.gadgetConfig.authentication?.signInPath ?? "/sign-in");
  }
  return { user: user.toJSON() };
}

export type AuthOutletContext = RootOutletContext & {
  user: User;
};

export default function ({ loaderData: { user } }: Route.ComponentProps) {
  const rootOutletContext = useOutletContext<RootOutletContext>();

  return (
    <div className="flex h-screen overflow-hidden">
      <div className="flex min-w-0 flex-1 flex-col md:pl-64">
        <header className="bg-background z-10 flex h-16 w-full items-center justify-between border-b px-6"></header>
        <main className="flex-1 overflow-x-auto overflow-y-auto">
          <div className="container mx-auto min-w-max px-6 py-8">
            <Outlet context={{ ...rootOutletContext, user } as AuthOutletContext} />
          </div>
        </main>
      </div>
    </div>
  );
}
