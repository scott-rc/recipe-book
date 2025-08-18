import { useActionForm } from "@gadgetinc/react";
import { CheckCircle } from "lucide-react";
import { api } from "../api";
import { Alert, AlertDescription } from "../components/ui/alert";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";

export default function () {
  const {
    submit,
    register,
    formState: { isSubmitSuccessful, isSubmitting },
  } = useActionForm(api.user.sendResetPassword);

  if (isSubmitSuccessful) {
    return (
      <Card className="p-8">
        <Alert className="border-green-200 bg-green-50">
          <AlertDescription className="flex flex-row items-center gap-2 text-green-900">
            <CheckCircle className="h-4 w-4 text-green-600" />
            Email has been sent. Please check your inbox.
          </AlertDescription>
        </Alert>
      </Card>
    );
  }

  return (
    <Card className="p-8">
      <form onSubmit={submit}>
        <div className="space-y-6">
          <h2 className="text-3xl font-bold tracking-tight">Reset password</h2>
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="space-y-1">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="Email" autoComplete="off" {...register("email")} />
              </div>
            </div>
            <Button className="w-full" size="lg" disabled={isSubmitting} type="submit">
              Send reset link
            </Button>
          </div>
        </div>
      </form>
    </Card>
  );
}
