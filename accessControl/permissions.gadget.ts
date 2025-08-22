import type { GadgetPermissions } from "gadget-server";

/**
 * This metadata describes the access control configuration available in your application.
 * Grants that are not defined here are set to false by default.
 *
 * View and edit your roles and permissions in the Gadget editor at https://recipe-book.gadget.app/edit/settings/permissions
 */
export const permissions: GadgetPermissions = {
  type: "gadget/permissions/v1",
  roles: {
    "signed-in": {
      storageKey: "signed-in",
      default: {
        read: true,
        action: true,
      },
      models: {
        image: {
          read: {
            filter: "accessControl/filters/image/tenant.gelly",
          },
          actions: {
            create: {
              filter: "accessControl/filters/image/tenant.gelly",
            },
            delete: {
              filter: "accessControl/filters/image/tenant.gelly",
            },
            update: {
              filter: "accessControl/filters/image/tenant.gelly",
            },
          },
        },
        recipe: {
          read: {
            filter: "accessControl/filters/recipe/tenant.gelly",
          },
          actions: {
            create: {
              filter: "accessControl/filters/recipe/tenant.gelly",
            },
            delete: {
              filter: "accessControl/filters/recipe/tenant.gelly",
            },
            reimport: {
              filter: "accessControl/filters/recipe/tenant.gelly",
            },
            update: {
              filter: "accessControl/filters/recipe/tenant.gelly",
            },
          },
        },
        user: {
          read: {
            filter: "accessControl/filters/user/tenant.gelly",
          },
          actions: {
            changePassword: {
              filter: "accessControl/filters/user/tenant.gelly",
            },
            signOut: {
              filter: "accessControl/filters/user/tenant.gelly",
            },
          },
        },
      },
      actions: {
        import: true,
      },
    },
    unauthenticated: {
      storageKey: "unauthenticated",
      models: {
        user: {
          actions: {
            resetPassword: true,
            sendResetPassword: true,
            sendVerifyEmail: true,
            signIn: true,
            signUp: true,
            verifyEmail: true,
          },
        },
      },
    },
  },
};
