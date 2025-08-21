import type { GadgetModel } from "gadget-server";

// This file describes the schema for the "recipe" model, go to https://recipe-book.gadget.app/edit to view/edit your model in Gadget
// For more information on how to update this file http://docs.gadget.dev

export const schema: GadgetModel = {
  type: "gadget/model-schema/v1",
  storageKey: "FHokbKIf076G",
  fields: {
    cookTime: {
      type: "number",
      validations: { required: true },
      storageKey: "K_LpwhmbiTUF",
    },
    directions: {
      type: "json",
      validations: { required: true },
      storageKey: "H558xm9Pkwjc",
    },
    images: {
      type: "hasManyThrough",
      sibling: { model: "image", relatedField: "recipes" },
      join: {
        model: "recipeImage",
        belongsToSelfField: "recipe",
        belongsToSiblingField: "image",
      },
      storageKey: "Eo-AnVXdBJwT",
    },
    ingredients: {
      type: "json",
      validations: { required: true },
      storageKey: "jUhWCYuOd3gr",
    },
    name: {
      type: "string",
      validations: { required: true, unique: true },
      storageKey: "qMPhapPNVzPa",
    },
    nutrition: { type: "json", storageKey: "ljnnAE0FZu_o" },
    prepTime: {
      type: "number",
      validations: { required: true },
      storageKey: "mDZ9mtF4Yw8E",
    },
    servingSize: {
      type: "number",
      validations: { required: true },
      storageKey: "cMn09SS5MoyC",
    },
    slug: {
      type: "string",
      validations: { required: true, unique: true },
      storageKey: "ulez72BnRAyM",
    },
    source: { type: "url", storageKey: "WrFF26SYVySN" },
    user: {
      type: "belongsTo",
      validations: { required: true },
      parent: { model: "user" },
      storageKey: "cdEEQhgl93z1",
    },
  },
};
