import type { GadgetModel } from "gadget-server";

// This file describes the schema for the "user" model, go to https://recipe-book.gadget.app/edit to view/edit your model in Gadget
// For more information on how to update this file http://docs.gadget.dev

export const schema: GadgetModel = {
  type: "gadget/model-schema/v1",
  storageKey: "mOh9OpH9f3W3",
  fields: {
    email: {
      type: "email",
      validations: { required: true, unique: true },
      storageKey: "0EULtnTgMyZy",
    },
    emailVerificationToken: {
      type: "string",
      storageKey: "nJAVR2FoyDPE",
    },
    emailVerificationTokenExpiration: {
      type: "dateTime",
      includeTime: true,
      storageKey: "Ejj8GxvyCmFP",
    },
    emailVerified: {
      type: "boolean",
      default: false,
      storageKey: "lrThLTQAAY2v",
    },
    firstName: { type: "string", storageKey: "S4Fkr0XeQfpr" },
    googleImageUrl: { type: "url", storageKey: "yH4lloXDTxGQ" },
    googleProfileId: { type: "string", storageKey: "y1EwqA17aN4C" },
    lastName: { type: "string", storageKey: "2JuRRpUrF6PJ" },
    lastSignedIn: {
      type: "dateTime",
      includeTime: true,
      storageKey: "W34ZuNgoBE_5",
    },
    password: {
      type: "password",
      validations: { strongPassword: true },
      storageKey: "Vkpbft1t_Fr1",
    },
    recipes: {
      type: "hasMany",
      children: { model: "recipe", belongsToField: "user" },
      storageKey: "rXBKpErCN7mu",
    },
    resetPasswordToken: {
      type: "string",
      storageKey: "yMYzJ9a3oGrr",
    },
    resetPasswordTokenExpiration: {
      type: "dateTime",
      includeTime: true,
      storageKey: "00GvO2-EaVwz",
    },
    roles: {
      type: "roleList",
      default: ["unauthenticated"],
      storageKey: "Q0CPBGzelnpk",
    },
  },
};
