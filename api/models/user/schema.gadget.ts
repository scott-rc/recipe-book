import type { GadgetModel } from "gadget-server";

// This file describes the schema for the "user" model, go to https://recipe-book.gadget.app/edit to view/edit your model in Gadget
// For more information on how to update this file http://docs.gadget.dev

export const schema: GadgetModel = {
  type: "gadget/model-schema/v2",
  storageKey: "mOh9OpH9f3W3",
  fields: {
    email: {
      type: "email",
      validations: { required: true, unique: true },
      storageKey: "0EULtnTgMyZy",
      searchIndex: false,
    },
    emailVerificationToken: {
      type: "string",
      storageKey: "nJAVR2FoyDPE",
      searchIndex: false,
    },
    emailVerificationTokenExpiration: {
      type: "dateTime",
      includeTime: true,
      storageKey: "Ejj8GxvyCmFP",
      filterIndex: false,
      searchIndex: false,
    },
    emailVerified: {
      type: "boolean",
      default: false,
      storageKey: "lrThLTQAAY2v",
      searchIndex: false,
    },
    firstName: {
      type: "string",
      storageKey: "S4Fkr0XeQfpr",
      filterIndex: false,
      searchIndex: false,
    },
    googleImageUrl: {
      type: "url",
      storageKey: "yH4lloXDTxGQ",
      filterIndex: false,
      searchIndex: false,
    },
    googleProfileId: {
      type: "string",
      storageKey: "y1EwqA17aN4C",
      filterIndex: false,
      searchIndex: false,
    },
    lastName: {
      type: "string",
      storageKey: "2JuRRpUrF6PJ",
      filterIndex: false,
      searchIndex: false,
    },
    lastSignedIn: {
      type: "dateTime",
      includeTime: true,
      storageKey: "W34ZuNgoBE_5",
      filterIndex: false,
      searchIndex: false,
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
      searchIndex: false,
    },
    resetPasswordTokenExpiration: {
      type: "dateTime",
      includeTime: true,
      storageKey: "00GvO2-EaVwz",
      filterIndex: false,
      searchIndex: false,
    },
    roles: {
      type: "roleList",
      default: ["unauthenticated"],
      storageKey: "Q0CPBGzelnpk",
      searchIndex: false,
    },
  },
  searchIndex: false,
};
