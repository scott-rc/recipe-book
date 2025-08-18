import { useActionForm } from "@gadgetinc/react";
import { Form, useNavigate } from "react-router-dom";
import { z } from "zod";
import { api } from "../api";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";

export default function () {
  const navigate = useNavigate();
  const { register, submit, formState, error } = useActionForm(api.import, {
    onSuccess: async (data) => {
      const { slug } = z.object({ slug: z.string() }).parse(data);
      await navigate(`/r/${slug}`);
    },
  });

  return (
    <div className="flex flex-col pt-6">
      <Form onSubmit={submit}>
        <div className="flex flex-grow justify-center gap-2">
          <Input style={{ width: "100%", maxWidth: "350px" }} placeholder="Recipe URL" {...register("source")}></Input>
          <Button disabled={formState.isSubmitting}>Import</Button>
        </div>
      </Form>
      <p className="text-red-500">{error?.message}</p>
    </div>
  );
}
