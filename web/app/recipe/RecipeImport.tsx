import { useActionForm } from "@gadgetinc/react";
import { Button, Flex, Text, TextField } from "@radix-ui/themes";
import type { ReactElement } from "react";
import { Form, useNavigate, type RouteObject } from "react-router-dom";
import { z } from "zod";
import { api } from "../../api";

RecipeImport.route = {
  path: "import",
  element: <RecipeImport />,
} satisfies RouteObject;

const actionDataSchema = z.object({ slug: z.string() }).nullish();

export function RecipeImport(): ReactElement {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const { register, submit, formState, error, actionData } = useActionForm(api.import);
  const navigate = useNavigate();

  const data = actionDataSchema.parse(actionData);
  if (data?.slug) {
    navigate(`/r/${data.slug}`);
  }

  return (
    <Flex direction="column" pt="6">
      <Form onSubmit={submit}>
        <Flex flexGrow="1" justify="center" gap="2">
          <TextField.Root style={{ width: "100%", maxWidth: "350px" }} placeholder="Recipe URL" {...register("source")}></TextField.Root>
          <Button loading={formState.isSubmitting}>Import</Button>
        </Flex>
      </Form>
      <Text color="red">{error?.message}</Text>
    </Flex>
  );
}
