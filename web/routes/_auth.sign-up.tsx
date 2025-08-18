import { useActionForm } from "@gadgetinc/react";
import { Link, useLocation, useNavigate } from "react-router";
import { api } from "../api";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Separator } from "../components/ui/separator";

export default function () {
  const { search } = useLocation();
  const navigate = useNavigate();
  const {
    submit,
    register,
    formState: { errors, isSubmitSuccessful, isSubmitting },
  } = useActionForm(api.user.signUp, {
    onSuccess: () => navigate("/"),
  });

  return (
    <div className="w-[420px]">
      <div className="space-y-8">
        <Card className="p-8">
          <form onSubmit={submit}>
            <div className="space-y-6">
              <h1 className="text-3xl font-bold tracking-tight">Sign up</h1>
              <Button variant="outline" size="lg" className="w-full" asChild>
                <a href={`/auth/google/start${search}`}>
                  <img className="mr-2 h-4 w-4" src="https://assets.gadget.dev/assets/default-app-assets/google.svg" alt="Google logo" />
                  Sign up with Google
                </a>
              </Button>
              <Separator />
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="space-y-1">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Email"
                      autoComplete="off"
                      {...register("email")}
                      className={errors.user?.email?.message ? "border-destructive" : ""}
                    />
                    {errors.user?.email?.message && <p className="text-destructive text-sm">{errors.user.email.message}</p>}
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="space-y-1">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Password"
                      autoComplete="off"
                      {...register("password")}
                      className={errors.user?.password?.message ? "border-red-500" : ""}
                    />
                    {errors.user?.password?.message && <p className="text-destructive text-sm">{errors.user.password.message}</p>}
                  </div>
                </div>
                {isSubmitSuccessful && <p className="text-sm text-green-500">Please check your inbox</p>}
                <Button className="w-full" size="lg" disabled={isSubmitting} type="submit">
                  Sign up with email
                </Button>
                {errors.root?.message && <p className="text-destructive text-sm">{errors.root.message}</p>}
              </div>
            </div>
          </form>
        </Card>
        <p className="text-muted-foreground mt-4 text-center text-sm">
          Already have an account?{" "}
          <Link to="/sign-in" className="text-primary font-medium hover:underline">
            Sign in →
          </Link>
        </p>
      </div>
    </div>
  );
}
