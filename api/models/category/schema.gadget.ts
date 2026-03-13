import type { GadgetModel } from "gadget-server";

// This file describes the schema for the "category" model, go to https://recipe-book.gadget.app/edit to view/edit your model in Gadget
// For more information on how to update this file http://docs.gadget.dev

export const schema: GadgetModel = {
  type: "gadget/model-schema/v2",
  storageKey: "hQ4rDyMb9wTe",
  fields: {
    name: {
      type: "string",
      validations: {
        required: true,
        unique: { scopeByField: "user" },
      },
      storageKey: "kR7vNxPm2wYd",
    },
    recipes: {
      type: "hasMany",
      children: { model: "recipe", belongsToField: "category" },
      storageKey: "tW3qLxHn5cBf",
    },
    user: {
      type: "belongsTo",
      validations: { required: true },
      parent: { model: "user" },
      storageKey: "pJ6sFzKv8mXa",
    },
  },
};
