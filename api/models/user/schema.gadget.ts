import type { GadgetModel } from "gadget-server";

// This file describes the schema for the "user" model, go to https://recipe-book.gadget.app/edit to view/edit your model in Gadget
// For more information on how to update this file http://docs.gadget.dev

export const schema: GadgetModel = {
  fields: {
    email: {
      searchIndex: false,
      storageKey: "0EULtnTgMyZy",
      type: "email",
      validations: { required: true, unique: true },
    },
    emailVerificationToken: {
      searchIndex: false,
      storageKey: "nJAVR2FoyDPE",
      type: "string",
    },
    emailVerificationTokenExpiration: {
      filterIndex: false,
      includeTime: true,
      searchIndex: false,
      storageKey: "Ejj8GxvyCmFP",
      type: "dateTime",
    },
    emailVerified: {
      default: false,
      searchIndex: false,
      storageKey: "lrThLTQAAY2v",
      type: "boolean",
    },
    firstName: {
      filterIndex: false,
      searchIndex: false,
      storageKey: "S4Fkr0XeQfpr",
      type: "string",
    },
    googleImageUrl: {
      filterIndex: false,
      searchIndex: false,
      storageKey: "yH4lloXDTxGQ",
      type: "url",
    },
    googleProfileId: {
      filterIndex: false,
      searchIndex: false,
      storageKey: "y1EwqA17aN4C",
      type: "string",
    },
    lastName: {
      filterIndex: false,
      searchIndex: false,
      storageKey: "2JuRRpUrF6PJ",
      type: "string",
    },
    lastSignedIn: {
      filterIndex: false,
      includeTime: true,
      searchIndex: false,
      storageKey: "W34ZuNgoBE_5",
      type: "dateTime",
    },
    password: {
      storageKey: "Vkpbft1t_Fr1",
      type: "password",
      validations: { strongPassword: true },
    },
    recipes: {
      children: { model: "recipe", belongsToField: "user" },
      storageKey: "rXBKpErCN7mu",
      type: "hasMany",
    },
    resetPasswordToken: {
      searchIndex: false,
      storageKey: "yMYzJ9a3oGrr",
      type: "string",
    },
    resetPasswordTokenExpiration: {
      filterIndex: false,
      includeTime: true,
      searchIndex: false,
      storageKey: "00GvO2-EaVwz",
      type: "dateTime",
    },
    roles: {
      default: ["unauthenticated"],
      searchIndex: false,
      storageKey: "Q0CPBGzelnpk",
      type: "roleList",
    },
  },
  searchIndex: false,
  storageKey: "mOh9OpH9f3W3",
  type: "gadget/model-schema/v2",
};
