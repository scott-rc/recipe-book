import type { AvailableUserSelection, UserRecord } from "@gadget-client/recipe-book";
import { useUser } from "@gadgetinc/react";
import type { ReactElement } from "react";
import { Link, Outlet, redirect, useOutletContext } from "react-router";
import { api } from "../api";
import { ThemeToggle } from "../components/theme-toggle";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
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

export async function loader({ context }: Route.LoaderArgs): Promise<{ user: User } | Response> {
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
    <div className="h-100dvh px-3">
      <header className="flex h-1/10 items-center justify-between pt-2">
        <h1 className="text-2xl font-bold">
          <Link to="/">Recipes</Link>
        </h1>
        <div className="flex items-center gap-x-5">
          <Link to="/import">Import</Link>
          <ThemeToggle />
          <Link to="/">
            <UserAvatar />
          </Link>
        </div>
      </header>
      <main className="h-9/10">
        <Outlet context={{ ...rootOutletContext, user } as AuthOutletContext} />
      </main>
    </div>
  );
}

function UserAvatar(): ReactElement {
  const user = useUser(api);

  return (
    <Avatar>
      <AvatarImage src={user.googleImageUrl ?? "https://assets.gadget.dev/assets/default-app-assets/default-user-icon.svg"} />
      <AvatarFallback>{(user.firstName ?? user.email).charAt(0)}</AvatarFallback>
    </Avatar>
  );
}
