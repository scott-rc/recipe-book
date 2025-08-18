import type { AvailableRecipeSelection, Recipe } from "@gadget-client/recipe-book";
import { useActionForm } from "@gadgetinc/react";
import { CheckIcon, PencilIcon, XIcon } from "lucide-react";
import ms from "ms";
import { lazy, useEffect, useState, type PropsWithChildren, type ReactElement } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Switch } from "../components/ui/switch";
import { Textarea } from "../components/ui/textarea";
import type { Route } from "./+types/_app.r.$slug";

const Markdown = lazy(() => import("react-markdown"));

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
  return await api.recipe.findBySlug(params.slug);
}

export default function ({ loaderData: recipe }: Route.ComponentProps) {
  return (
    <div className="mt-4 flex flex-col gap-y-4">
      <div className="flex items-center justify-between">
        <RecipeHeading recipe={recipe} />
        <RecipeWakeLock />
      </div>
      <div>
        <div className="flex items-center gap-2">
          <Label>Source</Label>
          <RecipeSource recipe={recipe} />
        </div>
        <div className="flex items-center gap-2">
          <Label>Serving Size</Label>
          <RecipeServingSize recipe={recipe} />
        </div>
        <div className="flex items-center gap-2">
          <Label>Prep Time</Label>
          <RecipePrepTime recipe={recipe} />
        </div>
        <div className="flex items-center gap-2">
          <Label>Cook Time</Label>
          <RecipeCookTime recipe={recipe} />
        </div>
      </div>
      <div className="flex">
        <div className="w-1/3">
          <RecipeIngredients recipe={recipe} />
        </div>
        <div className="w-2/3">
          <RecipeDirections recipe={recipe} />
        </div>
      </div>
      <div>
        <RecipeNutrition recipe={recipe} />
      </div>
    </div>
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
    <form>
      <div className="flex items-center gap-2">
        <Label htmlFor="cook-mode">Cook Mode</Label>
        <Switch id="cook-mode" checked={wakeLock} onCheckedChange={setWakeLock} />
      </div>
    </form>
  );
}

function RecipeHeading({ recipe }: { recipe: Pick<Recipe, "id" | "name" | "slug"> }): ReactElement {
  const { form, isEditing, Editable, EditButton, SaveButton, CancelButton } = useRecipeForm({ recipe, property: "name" });

  if (isEditing) {
    return (
      <Editable>
        <div className="flex items-center gap-2">
          <Input {...form.register("name")} className="min-w-[400px]" />
          <SaveButton />
          <CancelButton />
        </div>
      </Editable>
    );
  }

  return (
    <Editable>
      <div className="flex items-center gap-2">
        <h1 className="text-2xl font-bold">{recipe.name}</h1>
        <EditButton />
      </div>
    </Editable>
  );
}

function RecipeSource({ recipe }: { recipe: Pick<Recipe, "id" | "source"> }): ReactElement {
  const { form, isEditing, Editable, EditButton, SaveButton, CancelButton } = useRecipeForm({ recipe, property: "source" });

  if (isEditing) {
    const length = recipe.source?.length ?? 80;

    return (
      <Editable>
        <div className="flex items-center gap-2">
          <Input {...form.register("source")} style={{ minWidth: length * 8 }} />
          <SaveButton />
          <CancelButton />
        </div>
      </Editable>
    );
  }

  if (recipe.source) {
    return (
      <div className="flex items-center gap-2">
        <Link to={recipe.source}>{recipe.source}</Link>
        <EditButton />
      </div>
    );
  }

  return <></>;
}

function RecipeServingSize({ recipe }: { recipe: Pick<Recipe, "id" | "servingSize"> }): ReactElement {
  const { form, isEditing, Editable, EditButton, SaveButton, CancelButton } = useRecipeForm({ recipe, property: "servingSize" });

  if (isEditing) {
    return (
      <Editable>
        <div className="flex items-center gap-2">
          <div className="w-16">
            <Input {...form.register("servingSize", { valueAsNumber: true })} type="number" required maxLength={2} />
          </div>
          <SaveButton />
          <CancelButton />
        </div>
      </Editable>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <p>{recipe.servingSize}</p>
      <EditButton />
    </div>
  );
}

function RecipePrepTime({ recipe }: { recipe: Pick<Recipe, "id" | "prepTime"> }): ReactElement {
  const { form, isEditing, Editable, EditButton, SaveButton, CancelButton } = useRecipeForm({ recipe, property: "prepTime" });
  const [prepTime, setPrepTime] = useState(ms(recipe.prepTime, { long: true }));

  useEffect(() => {
    if (!prepTime) {
      return;
    }

    try {
      const parsed = ms(prepTime as ms.StringValue);
      form.setValue("prepTime", parsed);
    } catch {
      console.log("invalid prep time", prepTime);
      form.setError("prepTime", { message: "Invalid prep time" });
    }
  }, [form, prepTime]);

  if (isEditing) {
    return (
      <Editable>
        <div className="flex items-center gap-2">
          <Input name="prepTime" value={prepTime} onChange={(event) => setPrepTime(event.currentTarget.value)} required />
          <SaveButton />
          <CancelButton />
        </div>
      </Editable>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <p>{ms(recipe.prepTime, { long: true })}</p>
      <EditButton />
    </div>
  );
}

function RecipeCookTime({ recipe }: { recipe: Pick<Recipe, "id" | "cookTime"> }): ReactElement {
  const { form, isEditing, Editable, EditButton, SaveButton, CancelButton } = useRecipeForm({ recipe, property: "cookTime" });
  const [cookTime, setCookTime] = useState(ms(recipe.cookTime, { long: true }));

  useEffect(() => {
    if (!cookTime) {
      return;
    }

    try {
      const parsed = ms(cookTime as ms.StringValue);
      form.setValue("cookTime", parsed);
    } catch {
      console.log("invalid prep time", cookTime);
    }
  }, [form, cookTime]);

  if (isEditing) {
    return (
      <Editable>
        <div className="flex items-center gap-2">
          <Input value={cookTime} onChange={(event) => setCookTime(event.currentTarget.value)} required />
          <SaveButton />
          <CancelButton />
        </div>
      </Editable>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <p>{ms(recipe.cookTime, { long: true })}</p>
      <EditButton />
    </div>
  );
}

function RecipeIngredients({ recipe }: { recipe: Pick<Recipe, "id" | "ingredients"> }): ReactElement {
  const { form, isEditing, Editable, EditButton, SaveButton, CancelButton } = useRecipeForm({ recipe, property: "ingredients" });
  const ingredients = recipe.ingredients as string | string[];

  if (isEditing) {
    const rows = typeof ingredients === "string" ? ingredients.split("\n").length + 8 : ingredients.length + 8;

    return (
      <Editable>
        <div className="flex items-center gap-2">
          <h2 className="font-bold">Ingredients</h2>
          <SaveButton />
          <CancelButton />
        </div>
        <Textarea {...form.register("ingredients")} rows={rows} className="mt-3" />
      </Editable>
    );
  }

  if (typeof ingredients === "string") {
    return (
      <div>
        <div className="flex items-center gap-2">
          <h2 className="font-bold">Ingredients</h2>
          <EditButton />
        </div>
        <Markdown>{ingredients}</Markdown>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-2">
        <h2 className="font-bold">Ingredients</h2>
        <EditButton />
      </div>
      <ul>
        {ingredients.map((ingredient) => (
          <li key={ingredient}>
            <p>{ingredient}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

function RecipeDirections({ recipe }: { recipe: Pick<Recipe, "id" | "directions"> }): ReactElement {
  const { form, isEditing, Editable, EditButton, SaveButton, CancelButton } = useRecipeForm({ recipe, property: "directions" });
  const directions = recipe.directions as string | string[];

  if (isEditing) {
    const rows = typeof directions === "string" ? directions.split("\n").length + 8 : directions.length + 8;

    return (
      <Editable>
        <div className="flex items-center gap-2">
          <h2 className="font-bold">Directions</h2>
          <SaveButton />
          <CancelButton />
        </div>
        <Textarea {...form.register("directions")} rows={rows} className="mt-3 resize-y" />
      </Editable>
    );
  }

  if (typeof directions === "string") {
    return (
      <div>
        <div className="flex items-center gap-2">
          <h2 className="font-bold">Directions</h2>
          <EditButton />
        </div>
        <Markdown>{directions}</Markdown>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-2">
        <h2 className="font-bold">Directions</h2>
        <EditButton />
      </div>
      <ul>
        {directions.map((ingredient) => (
          <li key={ingredient}>
            <p>{ingredient}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

function RecipeNutrition({ recipe }: { recipe: Pick<Recipe, "id" | "nutrition"> }): ReactElement {
  const { form, isEditing, Editable, EditButton, SaveButton, CancelButton } = useRecipeForm({ recipe, property: "nutrition" });

  if (!recipe.nutrition) {
    return <></>;
  }

  const nutrition = recipe.nutrition as string | string[];
  const rows = typeof nutrition === "string" ? nutrition.split("\n").length + 8 : nutrition.length + 8;

  if (isEditing) {
    return (
      <Editable>
        <div className="flex items-center gap-2">
          <h2 className="font-bold">Nutrition</h2>
          <SaveButton />
          <CancelButton />
        </div>
        <Textarea {...form.register("nutrition")} rows={rows} className="mt-3" />
      </Editable>
    );
  }

  if (typeof nutrition === "string") {
    return (
      <div>
        <div className="flex items-center gap-2">
          <h2 className="font-bold">Nutrition</h2>
          <EditButton />
        </div>
        <Markdown>{nutrition}</Markdown>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-2">
        <h2 className="font-bold">Nutrition</h2>
        <EditButton />
      </div>

      <ul>
        {nutrition.map((ingredient) => (
          <li key={ingredient}>
            <p>{ingredient}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

type PartialExcept<T, K extends keyof T> = Partial<T> & Pick<T, K>;

function useRecipeForm<TProperty extends keyof AvailableRecipeSelection, TRecipe extends PartialExcept<Recipe, "id" | TProperty>>({
  recipe,
  property,
  selectExtra,
  onSuccess,
}: {
  recipe: TRecipe;
  property: TProperty;
  selectExtra?: AvailableRecipeSelection;
  onSuccess?: (recipe: TRecipe) => Promise<void> | void;
}) {
  const navigate = useNavigate();
  const [isEditing, setEditing] = useState(false);
  const form = useActionForm(api.recipe.update, {
    select: { id: true, [property]: true, slug: true, ...selectExtra },
    send: ["id", property],
    defaultValues: recipe as Recipe,
    onSuccess: async (recipe) => {
      setEditing(false);
      await navigate(`/r/${recipe.slug}`, { replace: true });
      await onSuccess?.(recipe as TRecipe);
    },
  });

  function Editable({ children }: PropsWithChildren): ReactElement {
    const error: { message?: string } | undefined | null = form.formState.errors[property] ?? form.error;

    return (
      <form onSubmit={form.submit} className="w-auto">
        {children}
        {error && <p className="text-red-500">{error.message}</p>}
      </form>
    );
  }

  function EditButton(): ReactElement {
    return (
      <Button type="button" variant="ghost" size="icon" onClick={() => setEditing(true)}>
        <PencilIcon />
      </Button>
    );
  }

  function SaveButton(): ReactElement {
    return (
      <Button type="submit" disabled={form.formState.isLoading} variant="ghost" size="icon">
        <CheckIcon />
      </Button>
    );
  }

  function CancelButton(): ReactElement {
    return (
      <Button type="button" onClick={() => setEditing(false)} variant="ghost" size="icon">
        <XIcon />
      </Button>
    );
  }

  return {
    form,
    isEditing,
    Editable,
    EditButton,
    SaveButton,
    CancelButton,
  };
}
