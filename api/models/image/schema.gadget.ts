import type { GadgetModel } from "gadget-server";

// This file describes the schema for the "image" model, go to https://recipe-book.gadget.app/edit to view/edit your model in Gadget
// For more information on how to update this file http://docs.gadget.dev

export const schema: GadgetModel = {
  fields: {
    alt: {
      filterIndex: false,
      storageKey: "cuiNgRcdIoNO",
      type: "string",
    },
    file: {
      allowPublicAccess: true,
      storageKey: "gPgO9zqmCLgA",
      type: "file",
      validations: { required: true },
    },
    height: {
      filterIndex: false,
      storageKey: "yXseAwE2JRKm",
      type: "number",
    },
    index: {
      filterIndex: false,
      storageKey: "ebQmo2cDrhu2",
      type: "number",
    },
    recipe: {
      parent: { model: "recipe" },
      storageKey: "suyazyTKhfus",
      type: "belongsTo",
    },
    src: {
      filterIndex: false,
      storageKey: "kWiJcowQPUu3",
      type: "string",
    },
    user: {
      parent: { model: "user" },
      storageKey: "cmN9C_tSSgVE-BelongsTo-User",
      type: "belongsTo",
    },
    width: {
      filterIndex: false,
      storageKey: "5MPaIbMDoOf3",
      type: "number",
    },
  },
  storageKey: "cmN9C_tSSgVE",
  type: "gadget/model-schema/v2",
};
