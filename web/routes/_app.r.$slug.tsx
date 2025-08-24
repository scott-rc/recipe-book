import { ChefHatIcon, ListIcon, LockIcon, LockOpenIcon, ScaleIcon } from "lucide-react";
import { useEffect, useState, type ReactElement } from "react";
import { api } from "../api";
import { Markdown } from "../components/markdown";
import { RecipeCard, recipeSelections, useRecipeForm } from "../components/recipe";
import { Label } from "../components/ui/label";
import { Switch } from "../components/ui/switch";
import { Textarea } from "../components/ui/textarea";
import type { Route } from "./+types/_app.r.$slug";

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
  return await api.recipe.findBySlug(params.slug, {
    select: {
      ...recipeSelections,
      ingredients: true,
      directions: true,
      nutrition: true,
    },
  });
}

type Recipe = Route.ComponentProps["loaderData"];

export default function ({ loaderData: recipe }: Route.ComponentProps) {
  return (
    <div className="h-full pb-32">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-16">
        <RecipeCard recipe={recipe} />
        <RecipeIngredients recipe={recipe} />
        <RecipeDirections recipe={recipe} />
        <RecipeNutrition recipe={recipe} />
      </div>
    </div>
  );
}

function RecipeIngredients({ recipe }: { recipe: Recipe }): ReactElement {
  const { form, isEditing, Editable, EditButton, SaveCancelButtons } = useRecipeForm({ recipe, property: "ingredients" });
  let ingredients = recipe.ingredients as string | string[];
  if (typeof ingredients !== "string") {
    ingredients = ingredients.join("\n- ");
  }
  const rows = ingredients.split("\n").length + 8;

  return (
    <Editable className="rounded-lg border p-4 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <ListIcon className="h-6 w-6" />
        <h2 className="text-2xl font-bold">Ingredients</h2>
        {isEditing ? <SaveCancelButtons /> : <EditButton />}
      </div>
      {isEditing ? <Textarea {...form.register("ingredients")} rows={rows} className="resize-none" /> : <Markdown>{ingredients}</Markdown>}
    </Editable>
  );
}

function RecipeDirections({ recipe }: { recipe: Recipe }): ReactElement {
  const { form, isEditing, Editable, EditButton, SaveCancelButtons } = useRecipeForm({ recipe, property: "directions" });
  let directions = recipe.directions as string | string[];
  if (typeof directions !== "string") {
    directions = directions.join("\n- ");
  }
  const rows = directions.split("\n").length + 8;

  return (
    <Editable className="rounded-lg border p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ChefHatIcon className="h-6 w-6" />
          <h2 className="text-2xl font-bold">Directions</h2>
          {isEditing ? <SaveCancelButtons /> : <EditButton />}
        </div>
        <RecipeWakeLock />
      </div>
      {isEditing ? <Textarea {...form.register("directions")} rows={rows} className="mt-3 resize-y" /> : <Markdown>{directions}</Markdown>}
    </Editable>
  );
}

function RecipeNutrition({ recipe }: { recipe: Recipe }): ReactElement {
  const { form, isEditing, Editable, EditButton, SaveCancelButtons } = useRecipeForm({ recipe, property: "nutrition" });
  if (!recipe.nutrition) {
    return <></>;
  }

  let nutrition = recipe.nutrition as string | string[];
  if (typeof nutrition !== "string") {
    nutrition = nutrition.join("\n- ");
  }
  const rows = nutrition.split("\n").length + 8;

  return (
    <Editable className="rounded-lg border p-4 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <ScaleIcon className="h-6 w-6" />
        <h2 className="text-2xl font-bold">Nutrition</h2>
        {isEditing ? <SaveCancelButtons /> : <EditButton />}
      </div>
      {isEditing ? <Textarea {...form.register("nutrition")} rows={rows} className="mt-3" /> : <Markdown>{nutrition}</Markdown>}
    </Editable>
  );
}

function RecipeWakeLock(): ReactElement {
  const [wakeLock, setWakeLock] = useState(false);

  useEffect(() => {
    if (!wakeLock) {
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-invalid-void-type
    let wakeLockPromise: Promise<WakeLockSentinel | void> | undefined;
    if ("wakeLock" in navigator) {
      wakeLockPromise = navigator.wakeLock.request("screen").catch((error: unknown) => console.error(error));
    }
    return () => {
      wakeLockPromise?.then((wakeLock) => wakeLock?.release()).catch((error: unknown) => console.error(error));
    };
  }, [wakeLock]);

  return (
    <div className="mt-2 flex items-center gap-2 self-start">
      <Label htmlFor="cook-mode" className="flex items-center gap-2 text-sm">
        {wakeLock ? <LockIcon className="h-4 w-4" /> : <LockOpenIcon className="h-4 w-4" />}
        <span className="hidden text-nowrap md:inline">Cook Mode</span>
        <Switch id="cook-mode" checked={wakeLock} onCheckedChange={setWakeLock} />
      </Label>
    </div>
  );
}
