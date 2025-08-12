import { SignedInOrRedirect, useUser } from "@gadgetinc/react";
import { type ReactElement } from "react";
import { Outlet, type RouteObject } from "react-router-dom";
import { api } from "../api";
import { ThemeToggle } from "../components/theme-toggle";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Link } from "./components/Link";
import { Recipes } from "./recipe/Recipes";

Root.route = {
  path: "/",
  element: (
    <SignedInOrRedirect>
      <Root />
    </SignedInOrRedirect>
  ),
  children: [Recipes.route],
} satisfies RouteObject;

export function Root(): ReactElement {
  return (
    <div className="h-100dvh px-3">
      <div className="flex h-1/10 items-center justify-between pt-2">
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
      </div>
      <div className="h-9/10">
        <Outlet />
      </div>
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
