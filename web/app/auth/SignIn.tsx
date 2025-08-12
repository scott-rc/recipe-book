import { SignedOutOrRedirect, useActionForm } from "@gadgetinc/react";
import type { ReactElement } from "react";
import { useLocation, type RouteObject } from "react-router-dom";
import { api } from "../../api";
import GoogleIcon from "../../assets/google.svg";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Separator } from "../../components/ui/separator";
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
    <div className="flex h-full items-center justify-center">
      <Card className="">
        <CardHeader>
          <CardTitle>Sign in</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Button asChild>
            <a href={`/auth/google/start${search}`}>
              <img src={GoogleIcon} width={18} height={18} /> Continue with Google
            </a>
          </Button>
          <Separator />
          <form className="flex flex-col gap-4" onSubmit={() => void submit()}>
            <Input placeholder="Email" autoComplete="email" {...register("email")} />
            <Input placeholder="Password" type="password" autoComplete="current-password" {...register("password")} />
            {formState.errors.root?.message && <p>{formState.errors.root.message}</p>}
            <Button disabled={formState.isSubmitting} type="submit">
              Sign in
            </Button>
          </form>
        </CardContent>
        <CardFooter>
          Forgot your password? <Link to="/forgot-password">Reset password</Link>
        </CardFooter>
      </Card>
    </div>
  );
}
