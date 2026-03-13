import type { GadgetModel } from "gadget-server";

// This file describes the schema for the "recipe" model, go to https://recipe-book.gadget.app/edit to view/edit your model in Gadget
// For more information on how to update this file http://docs.gadget.dev

export const schema: GadgetModel = {
  fields: {
    cookTime: {
      filterIndex: false,
      storageKey: "K_LpwhmbiTUF",
      type: "number",
      validations: { required: true },
    },
    directions: {
      filterIndex: false,
      storageKey: "H558xm9Pkwjc",
      type: "json",
      validations: { required: true },
    },
    directionsV2: {
      filterIndex: false,
      storageKey: "c68ekFKb1SNv",
      type: "string",
    },
    images: {
      children: { model: "image", belongsToField: "recipe" },
      storageKey: "Eo-AnVXdBJwT",
      type: "hasMany",
    },
    ingredients: {
      filterIndex: false,
      storageKey: "jUhWCYuOd3gr",
      type: "json",
      validations: { required: true },
    },
    ingredientsV2: {
      filterIndex: false,
      storageKey: "Jqjikg99GvkK",
      type: "string",
    },
    name: {
      filterIndex: false,
      storageKey: "qMPhapPNVzPa",
      type: "string",
      validations: {
        required: true,
        unique: { scopeByField: "user" },
      },
    },
    nutrition: {
      filterIndex: false,
      storageKey: "ljnnAE0FZu_o",
      type: "json",
    },
    nutritionV2: {
      filterIndex: false,
      storageKey: "tiIXa2VzCtHo",
      type: "string",
    },
    prepTime: {
      filterIndex: false,
      storageKey: "mDZ9mtF4Yw8E",
      type: "number",
      validations: { required: true },
    },
    servingSize: {
      filterIndex: false,
      storageKey: "cMn09SS5MoyC",
      type: "number",
      validations: { required: true },
    },
    slug: {
      storageKey: "ulez72BnRAyM",
      type: "string",
      validations: {
        required: true,
        unique: { scopeByField: "user" },
      },
    },
    source: {
      filterIndex: false,
      storageKey: "WrFF26SYVySN",
      type: "url",
    },
    user: {
      parent: { model: "user" },
      storageKey: "cdEEQhgl93z1",
      type: "belongsTo",
      validations: { required: true },
    },
  },
  storageKey: "FHokbKIf076G",
  type: "gadget/model-schema/v2",
};
