import { useActionForm } from "@gadgetinc/react";
import { CloudDownloadIcon, LoaderCircleIcon } from "lucide-react";
import { Form, href, useNavigate } from "react-router-dom";
import { z } from "zod";
import { api } from "../api";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";

export default function () {
  const navigate = useNavigate();
  const { register, submit, formState, error } = useActionForm(api.import, {
    onSuccess: async (data) => {
      const { slug } = z.object({ slug: z.string() }).parse(data);
      await navigate(href("/r/:slug", { slug }), { replace: true });
    },
  });

  return (
    <div className="grid h-full place-items-center">
      <Form onSubmit={submit} className="flex w-full max-w-md flex-col items-center gap-y-4">
        <Input className="w-full p-6" required placeholder="Recipe URL" {...register("source")} />
        <Button disabled={formState.isSubmitting} size="lg" className="w-full p-6">
          {formState.isSubmitting ? <LoaderCircleIcon className="h-8 w-8 animate-spin" /> : <CloudDownloadIcon className="h-8 w-8" />}
          Import
        </Button>
        <p className="text-red-500">{error?.message}</p>
      </Form>
    </div>
  );
}
