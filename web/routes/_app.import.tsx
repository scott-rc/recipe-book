import { useActionForm } from "@gadgetinc/react";
import { CloudDownloadIcon, LinkIcon, LoaderCircleIcon } from "lucide-react";
import { Form, href, useBlocker, useNavigate } from "react-router-dom";
import { z } from "zod";
import { api } from "../api";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../components/ui/alert-dialog";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Field, FieldError } from "../components/ui/field";
import { Input } from "../components/ui/input";

export default function ImportRoute() {
  const navigate = useNavigate();

  const { register, submit, formState, error } = useActionForm(api.import, {
    onSuccess: async (data) => {
      blocker.proceed?.();
      const { slug } = z.object({ slug: z.string() }).parse(data);
      await navigate(href("/r/:slug", { slug }), { replace: true });
    },
  });

  const blocker = useBlocker(formState.isSubmitting);

  return (
    <div className="grid h-full place-items-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-xl">Import Recipe</CardTitle>
          <CardDescription>Paste a URL from any recipe site to import it.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form onSubmit={submit} className="flex flex-col gap-4">
            <Field>
              <div className="relative">
                <LinkIcon className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                <Input className="py-6 pl-9 text-base" required placeholder="https://..." {...register("source")} />
              </div>
              <FieldError>{error?.message}</FieldError>
            </Field>
            <Button disabled={formState.isSubmitting} size="lg" className="w-full">
              {formState.isSubmitting ? (
                <LoaderCircleIcon className="size-5 animate-spin" />
              ) : (
                <CloudDownloadIcon className="size-5" />
              )}
              Import
            </Button>
          </Form>
        </CardContent>
      </Card>
      <AlertDialog open={blocker.state === "blocked" && formState.isSubmitting}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to leave?</AlertDialogTitle>
            <AlertDialogDescription>You are currently importing a recipe.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={blocker.reset}>Stay</AlertDialogCancel>
            <AlertDialogAction onClick={blocker.proceed}>Leave</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
