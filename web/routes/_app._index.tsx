import { Form, Link, useSearchParams } from "react-router-dom";
import { useDebouncedCallback } from "use-debounce";
import { api } from "../api";
import { RecipeCard, recipeSelections } from "../components/recipe";
import { Input } from "../components/ui/input";
import type { Route } from "./+types/_app._index";

export async function clientLoader({ request }: Route.ClientLoaderArgs) {
  return await api.recipe.findMany({
    search: new URL(request.url).searchParams.get("s"),
    select: recipeSelections,
  });
}

export default function ({ loaderData: recipes }: Route.ComponentProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const setDebouncedSearchParams = useDebouncedCallback((s: string) => setSearchParams({ s }), 250);

  return (
    <div className="pb-32">
      <Form>
        <Input
          autoFocus
          className="p-6"
          placeholder="Search recipes"
          name="s"
          defaultValue={searchParams.get("s") ?? ""}
          onChange={(e) => setDebouncedSearchParams(e.currentTarget.value)}
        />
      </Form>
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {recipes.length === 0 && (
          <div className="mt-8">
            <h1 className="text-center">No recipes found</h1>
          </div>
        )}
        {recipes.map((recipe) => {
          return (
            <Link to={`/r/${recipe.slug}`} viewTransition key={recipe.id}>
              <RecipeCard recipe={recipe} />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
