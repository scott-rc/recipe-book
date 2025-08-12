import { useFindMany } from "@gadgetinc/react";
import { Suspense, useState, type ReactElement } from "react";
import { Form, Link, useSearchParams, type RouteObject } from "react-router-dom";
import { api } from "../../api";
import { Card, CardContent } from "../../components/ui/card";
import { Input } from "../../components/ui/input";

RecipeIndex.route = {
  index: true,
  element: (
    <Suspense fallback={<div>Loading...</div>}>
      <RecipeIndex />
    </Suspense>
  ),
} satisfies RouteObject;

export function RecipeIndex(): ReactElement {
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("s") ?? "");

  return (
    <div className="pt-4">
      <Form>
        <Input placeholder="Search recipes" name="s" value={search} onChange={(e) => setSearch(e.currentTarget.value)} />
      </Form>
      <Suspense fallback={<div>Loading...</div>}>
        <RecipeCards />
      </Suspense>
    </div>
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
    return <p className="text-red-500">{error.message}</p>;
  }

  if (!recipes?.length) {
    return (
      <div className="mt-8">
        <h1 className="text-center">No recipes found</h1>
      </div>
    );
  }

  return (
    <div className="mt-4 grid grid-cols-3 gap-4 md:grid-cols-6">
      {recipes.map((recipe) => (
        <Card key={recipe.id}>
          <CardContent>
            <Link to={`/r/${recipe.slug}`}>{recipe.name}</Link>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
