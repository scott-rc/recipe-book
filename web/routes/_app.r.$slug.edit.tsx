import { useActionForm } from "@gadgetinc/react";
import { ArrowLeftIcon } from "lucide-react";
import { href, Link } from "react-router";
import { api } from "../api";
import { Button } from "../components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel, FieldSet } from "../components/ui/field";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { useRecipe } from "./_app.r.$slug";

export default function EditRecipeRoute() {
  const { recipe } = useRecipe();
  const form = useActionForm(api.recipe.update, {
    defaultValues: recipe,
  });

  return (
    <div className="flex flex-col gap-y-4">
      <Link
        to={href("/r/:slug", { slug: recipe.slug })}
        className="text-muted-foreground flex items-center gap-x-2 text-sm hover:underline"
      >
        <ArrowLeftIcon className="size-4" />
        Back
      </Link>
      <form onSubmit={form.submit}>
        <FieldSet>
          <FieldGroup>
            <Field data-invalid={form.control.getFieldState("name").invalid}>
              <FieldLabel htmlFor="name">Name</FieldLabel>
              <Input {...form.register("name")} id="name" autoComplete="off" />
              <FieldError errors={[form.formState.errors.name]} />
            </Field>
            <Field data-invalid={form.control.getFieldState("prepTime").invalid}>
              <FieldLabel htmlFor="prepTime">Prep Time</FieldLabel>
              <Input {...form.register("prepTime")} id="prepTime" required />
              <FieldError errors={[form.formState.errors.prepTime]} />
            </Field>
            <Field data-invalid={form.control.getFieldState("cookTime").invalid}>
              <FieldLabel htmlFor="cookTime">Cook Time</FieldLabel>
              <Input {...form.register("cookTime")} id="cookTime" required />
              <FieldError errors={[form.formState.errors.cookTime]} />
            </Field>
            <Field data-invalid={form.control.getFieldState("servingSize").invalid}>
              <FieldLabel htmlFor="servingSize">Serving Size</FieldLabel>
              <Input {...form.register("servingSize")} id="servingSize" required />
              <FieldError errors={[form.formState.errors.servingSize]} />
            </Field>
            <Field data-invalid={form.control.getFieldState("source").invalid}>
              <FieldLabel htmlFor="source">Source</FieldLabel>
              <Input {...form.register("source")} id="source" required />
              <FieldError errors={[form.formState.errors.source]} />
            </Field>
            <Field data-invalid={form.control.getFieldState("ingredients").invalid}>
              <FieldLabel htmlFor="ingredients">Ingredients</FieldLabel>
              <Textarea {...form.register("ingredients")} id="ingredients" required />
              <FieldError errors={[form.formState.errors.ingredients]} />
            </Field>
            <Field data-invalid={form.control.getFieldState("directions").invalid}>
              <FieldLabel htmlFor="directions">Directions</FieldLabel>
              <Textarea {...form.register("directions")} id="directions" required />
              <FieldError errors={[form.formState.errors.directions]} />
            </Field>
            <Field data-invalid={form.control.getFieldState("nutrition").invalid}>
              <FieldLabel htmlFor="nutrition">Nutrition</FieldLabel>
              <Textarea {...form.register("nutrition")} id="nutrition" required />
              <FieldError errors={[form.formState.errors.nutrition]} />
            </Field>
          </FieldGroup>
          <Button type="submit">Save</Button>
        </FieldSet>
      </form>
    </div>
  );
}
