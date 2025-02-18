import { useFindMany } from "@gadgetinc/react";
import { MagnifyingGlassIcon } from "@radix-ui/react-icons";
import { Box, Card, Grid, Heading, Skeleton, Text, TextField } from "@radix-ui/themes";
import { Suspense, useState, type ReactElement } from "react";
import { Form, useSearchParams, type RouteObject } from "react-router-dom";
import { api } from "../../api";
import { Link } from "../components/Link";

RecipeIndex.route = {
  index: true,
  element: (
    <Suspense fallback={<Skeleton />}>
      <RecipeIndex />
    </Suspense>
  ),
} satisfies RouteObject;

export function RecipeIndex(): ReactElement {
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("s") ?? "");

  return (
    <Box pt="4">
      <Form>
        <TextField.Root placeholder="Search recipes" size="3" name="s" value={search} onChange={(e) => setSearch(e.currentTarget.value)}>
          <TextField.Slot>
            <MagnifyingGlassIcon height="24" width="24" />
          </TextField.Slot>
        </TextField.Root>
      </Form>
      <Suspense fallback={<Skeleton />}>
        <RecipeCards />
      </Suspense>
    </Box>
  );
}

function RecipeCards(): ReactElement {
  const [searchParams] = useSearchParams();
  const [{ error, data: recipes }] = useFindMany(api.recipe, {
    search: searchParams.get("s"),
    suspense: true,
    select: {
      id: true,
      name: true,
      slug: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (error) {
    return <Text color="red">{error.message}</Text>;
  }

  if (!recipes?.length) {
    return (
      <Box mt="8">
        <Heading align="center">No recipes found</Heading>
      </Box>
    );
  }

  return (
    <Grid columns={{ initial: "3", md: "6" }} gap="4">
      {recipes.map((recipe) => (
        <Card key={recipe.id}>
          <Link to={"/r/" + recipe.slug}>{recipe.name}</Link>
        </Card>
      ))}
    </Grid>
  );
}
