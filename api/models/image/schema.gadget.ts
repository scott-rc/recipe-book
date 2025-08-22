import type { GadgetModel } from "gadget-server";

// This file describes the schema for the "image" model, go to https://recipe-book.gadget.app/edit to view/edit your model in Gadget
// For more information on how to update this file http://docs.gadget.dev

export const schema: GadgetModel = {
  type: "gadget/model-schema/v1",
  storageKey: "cmN9C_tSSgVE",
  fields: {
    alt: { type: "string", storageKey: "cuiNgRcdIoNO" },
    file: {
      type: "file",
      allowPublicAccess: true,
      validations: { required: true },
      storageKey: "gPgO9zqmCLgA",
    },
    height: { type: "number", storageKey: "yXseAwE2JRKm" },
    recipe: {
      type: "belongsTo",
      parent: { model: "recipe" },
      storageKey: "suyazyTKhfus",
    },
    src: {
      type: "string",
      validations: { required: true },
      storageKey: "kWiJcowQPUu3",
    },
    user: {
      type: "belongsTo",
      parent: { model: "user" },
      storageKey: "cmN9C_tSSgVE-BelongsTo-User",
    },
    width: { type: "number", storageKey: "5MPaIbMDoOf3" },
  },
};
