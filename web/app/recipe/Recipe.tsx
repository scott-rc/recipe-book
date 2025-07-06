import type { AvailableRecipeSelection, Recipe } from "@gadget-client/recipe-book";
import { useActionForm, useFindBy } from "@gadgetinc/react";
import { CheckIcon, Cross2Icon, Pencil2Icon } from "@radix-ui/react-icons";
import { Box, DataList, Flex, Heading, IconButton, Switch, Text, TextArea, TextField } from "@radix-ui/themes";
import ms from "ms";
import { lazy, useEffect, useState, type PropsWithChildren, type ReactElement } from "react";
import { useNavigate, useParams, type RouteObject } from "react-router-dom";
import { api } from "../../api";
import { Link } from "../components/Link";

const Markdown = lazy(() => import("react-markdown"));

Recipe.route = {
  path: "r/:slug",
  element: <Recipe />,
} satisfies RouteObject;

export function Recipe(): ReactElement {
  const { slug } = useParams() as { slug: string };
  const [{ error, data: recipe }] = useFindBy(api.recipe.findBySlug, slug, { suspense: true });

  if (error) {
    return <Text color="red">{error.message}</Text>;
  }

  if (!recipe) {
    return <Text>Not found</Text>;
  }

  return (
    <Flex mt="4" gapY="4" direction="column">
      <Flex justify="between" align="center">
        <RecipeHeading recipe={recipe} />
        <RecipeWakeLock />
      </Flex>
      <DataList.Root>
        <DataList.Item>
          <DataList.Label>Source</DataList.Label>
          <DataList.Value>
            <RecipeSource recipe={recipe} />
          </DataList.Value>
        </DataList.Item>
        <DataList.Item>
          <DataList.Label>Serving Size</DataList.Label>
          <DataList.Value>
            <RecipeServingSize recipe={recipe} />
          </DataList.Value>
        </DataList.Item>
        <DataList.Item>
          <DataList.Label>Prep Time</DataList.Label>
          <DataList.Value>
            <RecipePrepTime recipe={recipe} />
          </DataList.Value>
        </DataList.Item>
        <DataList.Item>
          <DataList.Label>Cook Time</DataList.Label>
          <DataList.Value>
            <RecipeCookTime recipe={recipe} />
          </DataList.Value>
        </DataList.Item>
      </DataList.Root>
      <Flex>
        <Box width="33.333333%">
          <RecipeIngredients recipe={recipe} />
        </Box>
        <Box width="66.666667%">
          <RecipeDirections recipe={recipe} />
        </Box>
      </Flex>
      <Box>
        <RecipeNutrition recipe={recipe} />
      </Box>
    </Flex>
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
      <Flex align="center" gapX="2">
        <label htmlFor="cook-mode">Cook Mode</label>
        <Switch id="cook-mode" checked={wakeLock} onCheckedChange={setWakeLock} />
      </Flex>
    </form>
  );
}

function RecipeHeading({ recipe }: { recipe: Pick<Recipe, "id" | "name" | "slug"> }): ReactElement {
  const navigate = useNavigate();
  const { form, isEditing, Editable, EditButton, SaveButton, CancelButton } = useRecipeForm({
    recipe,
    property: "name",
    onSuccess: (recipe) => {
      navigate(`/r/${recipe.slug}`, { replace: true });
    },
  });

  if (isEditing) {
    return (
      <Editable>
        <Flex gap="2" align="center">
          <TextField.Root {...form.register("name")} size="3" style={{ minWidth: "400px" }} />
          <SaveButton />
          <CancelButton />
        </Flex>
      </Editable>
    );
  }

  return (
    <Editable>
      <Flex gap="2" align="center">
        <Heading>{recipe.name}</Heading>
        <EditButton />
      </Flex>
    </Editable>
  );
}

function RecipeSource({ recipe }: { recipe: Pick<Recipe, "id" | "source"> }): ReactElement {
  const { form, isEditing, Editable, EditButton, SaveButton, CancelButton } = useRecipeForm({ recipe, property: "source" });

  if (isEditing) {
    const length = recipe.source?.length ?? 80;

    return (
      <Editable>
        <Flex gap="2" align="center">
          <TextField.Root {...form.register("source")} style={{ minWidth: length * 8 }} />
          <SaveButton />
          <CancelButton />
        </Flex>
      </Editable>
    );
  }

  if (recipe.source) {
    return (
      <Flex gap="2" align="center">
        <Link to={recipe.source}>{recipe.source}</Link>
        <EditButton />
      </Flex>
    );
  }

  return <></>;
}

function RecipeServingSize({ recipe }: { recipe: Pick<Recipe, "id" | "servingSize"> }): ReactElement {
  const { form, isEditing, Editable, EditButton, SaveButton, CancelButton } = useRecipeForm({ recipe, property: "servingSize" });

  if (isEditing) {
    return (
      <Editable>
        <Flex gap="2" align="center">
          <Box width="32px">
            <TextField.Root {...form.register("servingSize", { valueAsNumber: true })} type="number" required maxLength={2} />
          </Box>
          <SaveButton />
          <CancelButton />
        </Flex>
      </Editable>
    );
  }

  return (
    <Flex gap="2" align="center">
      <Text>{recipe.servingSize}</Text>
      <EditButton />
    </Flex>
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
        <Flex gap="2" align="center">
          <TextField.Root name="prepTime" value={prepTime} onChange={(event) => setPrepTime(event.currentTarget.value)} required />
          <SaveButton />
          <CancelButton />
        </Flex>
      </Editable>
    );
  }

  return (
    <Flex gap="2" align="center">
      <Text>{ms(recipe.prepTime, { long: true })}</Text>
      <EditButton />
    </Flex>
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
        <Flex gap="2" align="center">
          <TextField.Root value={cookTime} onChange={(event) => setCookTime(event.currentTarget.value)} required />
          <SaveButton />
          <CancelButton />
        </Flex>
      </Editable>
    );
  }

  return (
    <Flex gap="2" align="center">
      <Text>{ms(recipe.cookTime, { long: true })}</Text>
      <EditButton />
    </Flex>
  );
}

function RecipeIngredients({ recipe }: { recipe: Pick<Recipe, "id" | "ingredients"> }): ReactElement {
  const { form, isEditing, Editable, EditButton, SaveButton, CancelButton } = useRecipeForm({ recipe, property: "ingredients" });
  const ingredients = recipe.ingredients as string | string[];

  if (isEditing) {
    const rows = typeof ingredients === "string" ? ingredients.split("\n").length + 8 : ingredients.length + 8;

    return (
      <Editable>
        <Flex gap="2" align="center">
          <Heading size="5">Ingredients</Heading>
          <SaveButton />
          <CancelButton />
        </Flex>
        <TextArea {...form.register("ingredients")} rows={rows} mt="3" />
      </Editable>
    );
  }

  if (typeof ingredients === "string") {
    return (
      <Box>
        <Flex gap="2" align="center">
          <Heading size="5">Ingredients</Heading>
          <EditButton />
        </Flex>
        <Markdown>{ingredients}</Markdown>
      </Box>
    );
  }

  return (
    <Box>
      <Flex gap="2" align="center">
        <Heading size="5">Ingredients</Heading>
        <EditButton />
      </Flex>
      <ul>
        {ingredients.map((ingredient) => (
          <li key={ingredient}>
            <Text>{ingredient}</Text>
          </li>
        ))}
      </ul>
    </Box>
  );
}

function RecipeDirections({ recipe }: { recipe: Pick<Recipe, "id" | "directions"> }): ReactElement {
  const { form, isEditing, Editable, EditButton, SaveButton, CancelButton } = useRecipeForm({ recipe, property: "directions" });
  const directions = recipe.directions as string | string[];

  if (isEditing) {
    const rows = typeof directions === "string" ? directions.split("\n").length + 8 : directions.length + 8;

    return (
      <Editable>
        <Flex gap="2" align="center">
          <Heading size="5">Directions</Heading>
          <SaveButton />
          <CancelButton />
        </Flex>
        <TextArea {...form.register("directions")} rows={rows} resize="vertical" mt="3" />
      </Editable>
    );
  }

  if (typeof directions === "string") {
    return (
      <Box>
        <Flex gap="2" align="center">
          <Heading size="5">Directions</Heading>
          <EditButton />
        </Flex>
        <Markdown>{directions}</Markdown>
      </Box>
    );
  }

  return (
    <Box>
      <Flex gap="2" align="center">
        <Heading size="5">Directions</Heading>
        <EditButton />
      </Flex>
      <ul>
        {directions.map((ingredient) => (
          <li key={ingredient}>
            <Text>{ingredient}</Text>
          </li>
        ))}
      </ul>
    </Box>
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
        <Flex gap="2" align="center">
          <Heading size="5">Nutrition</Heading>
          <SaveButton />
          <CancelButton />
        </Flex>
        <TextArea {...form.register("nutrition")} rows={rows} mt="3" />
      </Editable>
    );
  }

  if (typeof nutrition === "string") {
    return (
      <Box>
        <Flex gap="2" align="center">
          <Heading size="5">Nutrition</Heading>
          <EditButton />
        </Flex>
        <Markdown>{nutrition}</Markdown>
      </Box>
    );
  }

  return (
    <Box>
      <Flex gap="2" align="center">
        <Heading size="5">Nutrition</Heading>
        <EditButton />
      </Flex>

      <ul>
        {nutrition.map((ingredient) => (
          <li key={ingredient}>
            <Text>{ingredient}</Text>
          </li>
        ))}
      </ul>
    </Box>
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
  onSuccess?: (recipe: TRecipe) => void;
}) {
  const [isEditing, setEditing] = useState(false);
  const form = useActionForm(api.recipe.update, {
    select: { id: true, [property]: true, ...selectExtra },
    send: ["id", property],
    defaultValues: recipe as Recipe,
    onSuccess: (recipe) => {
      setEditing(false);
      onSuccess?.(recipe as TRecipe);
    },
  });

  function Editable({ children }: PropsWithChildren): ReactElement {
    const error: { message?: string } | undefined | null = form.formState.errors[property] ?? form.error;

    return (
      <form onSubmit={form.submit} style={{ width: "auto" }}>
        {children}
        {error && (
          <Text color="red" size="1">
            {error.message}
          </Text>
        )}
      </form>
    );
  }

  function EditButton(): ReactElement {
    return (
      <IconButton type="button" size="1">
        <Pencil2Icon onClick={() => setEditing(true)} />
      </IconButton>
    );
  }

  function SaveButton(): ReactElement {
    return (
      <IconButton type="submit" loading={form.formState.isLoading} size="1">
        <CheckIcon />
      </IconButton>
    );
  }

  function CancelButton(): ReactElement {
    return (
      <IconButton type="button" onClick={() => setEditing(false)} size="1">
        <Cross2Icon />
      </IconButton>
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
