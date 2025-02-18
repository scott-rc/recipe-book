import { SignedOutOrRedirect, useActionForm } from "@gadgetinc/react";
import { Button, Card, Flex, Heading, Separator, Text, TextField } from "@radix-ui/themes";
import type { ReactElement } from "react";
import { useLocation, type RouteObject } from "react-router-dom";
import { api } from "../../api";
import GoogleIcon from "../../assets/google.svg";
import { Link } from "../components/Link";

SignIn.route = {
  path: "/sign-in",
  element: (
    <SignedOutOrRedirect>
      <SignIn />
    </SignedOutOrRedirect>
  ),
} satisfies RouteObject;

export function SignIn(): ReactElement {
  const { register, submit, formState } = useActionForm(api.user.signIn);
  const { search } = useLocation();

  return (
    <Flex align="center" justify="center" height="100%">
      <Card>
        <Flex gap="4" direction="column">
          <Heading>Sign in</Heading>
          <Button asChild>
            <a href={`/auth/google/start${search}`}>
              <img src={GoogleIcon} width={18} height={18} /> Continue with Google
            </a>
          </Button>

          <Separator size="4" />

          <Flex asChild gap="3" direction="column">
            <form onSubmit={() => void submit()}>
              <TextField.Root placeholder="Email" autoComplete="email" {...register("email")} />
              <TextField.Root placeholder="Password" type="password" autoComplete="current-password" {...register("password")} />
              {formState.errors.root?.message && <p>{formState.errors.root.message}</p>}
              <Button loading={formState.isSubmitting} type="submit">
                Sign in
              </Button>
            </form>
          </Flex>

          <Text>
            Forgot your password? <Link to="/forgot-password">Reset password</Link>
          </Text>
        </Flex>
      </Card>
    </Flex>
  );
}
