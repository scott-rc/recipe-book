import type { GadgetModel } from "gadget-server";

// This file describes the schema for the "session" model, go to https://recipe-book.gadget.app/edit to view/edit your model in Gadget
// For more information on how to update this file http://docs.gadget.dev

export const schema: GadgetModel = {
  fields: {
    user: {
      parent: { model: "user" },
      storageKey: "amYs51fR0o-c",
      type: "belongsTo",
    },
  },
  storageKey: "6A-VQFDUVLY4",
  type: "gadget/model-schema/v2",
};
