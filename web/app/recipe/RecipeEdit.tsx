import { useActionForm, useFindBy } from "@gadgetinc/react";
import { CheckIcon, Cross2Icon } from "@radix-ui/react-icons";
import { Box, DataList, Flex, Heading, IconButton, Text, TextField } from "@radix-ui/themes";
import ms from "ms";
import { useEffect, useState, type ReactElement } from "react";
import { useParams, type RouteObject } from "react-router-dom";
import { api } from "../../api";

RecipeEdit.route = {
  path: "r/:slug/edit",
  element: <RecipeEdit />,
} as RouteObject;

export function RecipeEdit(): ReactElement {
  const { slug } = useParams() as { slug: string };
  const [{ error: findByError, data: recipe }] = useFindBy(api.recipe.findBySlug, slug, { suspense: true });
  const { error: formError, register, submit, setValue } = useActionForm(api.recipe.update, { defaultValues: recipe });
  const [prepTime, setPrepTime] = useState(ms(recipe?.prepTime ?? 0, { long: true }));

  if (findByError ?? formError) {
    const error = (findByError ?? formError) as Error;
    return <Text color="red">{error.message}</Text>;
  }

  if (!recipe) {
    return <Text>Recipe {slug} not found.</Text>;
  }

  useEffect(() => {
    if (!prepTime) {
      return;
    }

    try {
      const parsed = ms(prepTime as ms.StringValue);
      setValue("prepTime", parsed);
    } catch {
      console.log("invalid prep time", prepTime);
    }
  }, [prepTime]);

  return (
    <form onSubmit={submit}>
      <Flex mt="4" gapY="4" direction="column">
        <Flex gap="2" align="center">
          <TextField.Root {...register("name")} size="3" style={{ minWidth: "400px" }} />
          <IconButton>
            <CheckIcon />
          </IconButton>
          <IconButton>
            <Cross2Icon />
          </IconButton>
        </Flex>
        <DataList.Root>
          <DataList.Item>
            <DataList.Label>Source</DataList.Label>
            <DataList.Value>
              <TextField.Root {...register("source")} />
            </DataList.Value>
          </DataList.Item>
          <DataList.Item>
            <DataList.Label>Serving Size</DataList.Label>
            <DataList.Value>
              <Box width="36px">
                <TextField.Root {...register("servingSize")} type="number" required maxLength={2} />
              </Box>
            </DataList.Value>
          </DataList.Item>
          <DataList.Item>
            <DataList.Label>Prep Time</DataList.Label>
            <DataList.Value>
              <TextField.Root value={prepTime} onChange={(event) => setPrepTime(event.currentTarget.value)} required />
            </DataList.Value>
          </DataList.Item>
          <DataList.Item>
            <DataList.Label>Cook Time</DataList.Label>
            <DataList.Value>{ms(recipe.cookTime, { long: true })}</DataList.Value>
          </DataList.Item>
        </DataList.Root>
        <Flex>
          <Box width="33.333333%">
            <Heading size="5">Ingredients</Heading>
          </Box>
          <Box width="66.666667%">
            <Heading size="5">Directions</Heading>
          </Box>
        </Flex>
        <Box>
          <Heading size="5">Nutrition</Heading>
        </Box>
      </Flex>
    </form>
  );
}
