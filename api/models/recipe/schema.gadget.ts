import type { GadgetModel } from "gadget-server";

// This file describes the schema for the "recipe" model, go to https://recipe-book.gadget.app/edit to view/edit your model in Gadget
// For more information on how to update this file http://docs.gadget.dev

export const schema: GadgetModel = {
  type: "gadget/model-schema/v2",
  storageKey: "FHokbKIf076G",
  fields: {
    category: {
      type: "belongsTo",
      parent: { model: "category" },
      storageKey: "nV2gAyRk7pWx",
    },
    cookTime: {
      type: "number",
      validations: { required: true },
      storageKey: "K_LpwhmbiTUF",
      filterIndex: false,
    },
    directions: {
      type: "json",
      validations: { required: true },
      storageKey: "H558xm9Pkwjc",
      filterIndex: false,
    },
    directionsV2: {
      type: "string",
      storageKey: "c68ekFKb1SNv",
      filterIndex: false,
    },
    favourite: {
      type: "boolean",
      default: false,
      storageKey: "qR7kFavBool1",
    },
    images: {
      type: "hasMany",
      children: { model: "image", belongsToField: "recipe" },
      storageKey: "Eo-AnVXdBJwT",
    },
    ingredients: {
      type: "json",
      validations: { required: true },
      storageKey: "jUhWCYuOd3gr",
      filterIndex: false,
    },
    ingredientsV2: {
      type: "string",
      storageKey: "Jqjikg99GvkK",
      filterIndex: false,
    },
    name: {
      type: "string",
      validations: {
        required: true,
        unique: { scopeByField: "user" },
      },
      storageKey: "qMPhapPNVzPa",
      filterIndex: false,
    },
    nutrition: {
      type: "json",
      storageKey: "ljnnAE0FZu_o",
      filterIndex: false,
    },
    nutritionV2: {
      type: "string",
      storageKey: "tiIXa2VzCtHo",
      filterIndex: false,
    },
    prepTime: {
      type: "number",
      validations: { required: true },
      storageKey: "mDZ9mtF4Yw8E",
      filterIndex: false,
    },
    servingSize: {
      type: "number",
      validations: { required: true },
      storageKey: "cMn09SS5MoyC",
      filterIndex: false,
    },
    slug: {
      type: "string",
      validations: {
        required: true,
        unique: { scopeByField: "user" },
      },
      storageKey: "ulez72BnRAyM",
    },
    source: {
      type: "url",
      storageKey: "WrFF26SYVySN",
      filterIndex: false,
    },
    user: {
      type: "belongsTo",
      validations: { required: true },
      parent: { model: "user" },
      storageKey: "cdEEQhgl93z1",
    },
  },
};
