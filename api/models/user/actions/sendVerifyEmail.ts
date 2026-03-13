// Powers the sign up flow, this action is called from api/models/user/actions/signUp.js
import { Config, DefaultEmailTemplates, type SendVerifyEmailUserActionContext, applyParams, save } from "gadget-server";
import { z } from "zod";

export const options = {
  actionType: "custom",
  returnType: true,
  triggers: {
    sendVerificationEmail: true,
  },
};

export async function run({ params, record }: SendVerifyEmailUserActionContext): Promise<void> {
  applyParams(params, record);
  await save(record);
}

export async function onSuccess({ params, record, logger, emails }: SendVerifyEmailUserActionContext): Promise<void> {
  const { user } = z
    .object({ user: z.object({ emailVerificationCode: z.string() }) })
    .catch({ user: { emailVerificationCode: "" } })
    .parse(params);

  if (
    (record.emailVerified ?? false) ||
    record.emailVerificationToken === null ||
    record.emailVerificationToken === undefined ||
    record.emailVerificationToken === "" ||
    !user.emailVerificationCode
  ) {
    if (record.emailVerified !== true) {
      logger.error("missing email verification code or token");
    }
    return;
  }

  // Generates link to reset password
  const url = new URL("/verify-email", Config.appUrl);
  url.searchParams.append("code", user.emailVerificationCode);

  // Sends link to user
  await emails.sendMail({
    html: DefaultEmailTemplates.renderVerifyEmailTemplate({ url: url.toString() }),
    subject: `Verify your email with ${Config.appName}`,
    to: record.email,
  });
}
