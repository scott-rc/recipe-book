import type { GadgetModel } from "gadget-server";

// This file describes the schema for the "recipeImage" model, go to https://recipe-book.gadget.app/edit to view/edit your model in Gadget
// For more information on how to update this file http://docs.gadget.dev

export const schema: GadgetModel = {
  type: "gadget/model-schema/v1",
  storageKey: "buPWsG4Msxyo",
  fields: {
    image: {
      type: "belongsTo",
      validations: { required: true },
      parent: { model: "image" },
      storageKey: "RriyIAI5SF63",
    },
    recipe: {
      type: "belongsTo",
      validations: { required: true },
      parent: { model: "recipe" },
      storageKey: "kGaaKoHKelex",
    },
  },
};
