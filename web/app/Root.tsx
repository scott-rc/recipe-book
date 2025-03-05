import { SignedInOrRedirect, useUser } from "@gadgetinc/react";
import { Avatar, Box, Container, Flex, Heading, IconButton } from "@radix-ui/themes";
import { MoonIcon, SunIcon } from "@radix-ui/react-icons";
import { type ReactElement } from "react";
import { Outlet, type RouteObject } from "react-router-dom";
import { api } from "../api";
import { Link } from "./components/Link";
import { Recipes } from "./recipe/Recipes";
import { useThemeSwitcher } from "./hooks/theme";

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
  const { theme, setTheme } = useThemeSwitcher();

  return (
    <Container height="100dvh" px="3">
      <Flex justify="between" align="center" pt="2" height="10dvh">
        <Heading>
          <Link to="/">Recipes</Link>
        </Heading>
        <Flex align="center" gapX="5">
          <Link to="/import" underline="always" weight="medium" size="5">
            Import
          </Link>
          <IconButton variant="ghost">
            {theme === "light" ? <MoonIcon onClick={() => setTheme("dark")} /> : <SunIcon onClick={() => setTheme("light")} />}
          </IconButton>
          <Link to="/">
            <UserAvatar />
          </Link>
        </Flex>
      </Flex>
      <Box height="90dvh">
        <Outlet />
      </Box>
    </Container>
  );
}

function UserAvatar(): ReactElement {
  const user = useUser(api);

  return (
    <Avatar
      src={user.googleImageUrl ?? "https://assets.gadget.dev/assets/default-app-assets/default-user-icon.svg"}
      fallback={(user.firstName ?? user.email).charAt(0)}
    />
  );
}
