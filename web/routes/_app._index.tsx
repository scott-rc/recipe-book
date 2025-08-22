import { useFindMany } from "@gadgetinc/react";
import { Suspense, useState, type ReactElement } from "react";
import { Form, Link, useSearchParams } from "react-router-dom";
import { api } from "../api";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";

export default function () {
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("s") ?? "");

  return (
    <div className="pb-32">
      <Form>
        <Input className="p-6" placeholder="Search recipes" name="s" value={search} onChange={(e) => setSearch(e.currentTarget.value)} />
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
      images: {
        edges: {
          node: {
            id: true,
            height: true,
            width: true,
            file: { url: true, mimeType: true },
            alt: true,
          },
        },
      },
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
    <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-3">
      {recipes.map((recipe) => {
        const image = recipe.images.edges.map((image) => image.node)[0] ?? {
          id: "placeholder",
          height: 400,
          width: 600,
          file: { url: "/placeholder.svg", mimeType: "image/svg+xml" },
          alt: "Placeholder",
        };

        return (
          <Link to={`/r/${recipe.slug}`} key={recipe.id}>
            <Card className="h-full justify-between">
              <CardHeader>
                <CardTitle>{recipe.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <img
                  src={image.file.url}
                  alt={image.alt}
                  className="aspect-3/2 rounded-lg object-cover"
                  width={image.width ?? undefined}
                  height={image.height ?? undefined}
                />
              </CardContent>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}
