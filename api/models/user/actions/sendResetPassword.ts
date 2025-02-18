import { applyParams, Config, DefaultEmailTemplates, save, type SendResetPasswordUserActionContext } from "gadget-server";
import { z } from "zod";

export const options = {
  actionType: "custom",
  returnType: true,
  triggers: {
    sendResetPassword: true,
  },
};

export async function run({ params, record }: SendResetPasswordUserActionContext): Promise<void> {
  // Applies new hashed code 'resetPasswordToken' to the user record and saves to database
  applyParams(params, record);
  await save(record);
}

export async function onSuccess({ params, record, emails, logger }: SendResetPasswordUserActionContext): Promise<void> {
  const { user } = z
    .object({ user: z.object({ resetPasswordCode: z.string() }) })
    .catch({ user: { resetPasswordCode: "" } })
    .parse(params);

  if (!record.resetPasswordToken || !user.resetPasswordCode) {
    logger.error("missing reset password code or token");
    return;
  }

  // Generates link to reset password
  const url = new URL("/reset-password", Config.appUrl);
  url.searchParams.append("code", user.resetPasswordCode);

  // Sends link to user
  await emails.sendMail({
    to: record.email,
    subject: `Reset password request from ${Config.appName}`,
    html: DefaultEmailTemplates.renderResetPasswordTemplate({ url: url.toString() }),
  });
}
