import { Email } from "@convex-dev/auth/providers/Email";
import { RandomReader, generateRandomString } from "@oslojs/crypto/random";

const createSignInEmailHtml = (token: string, email: string) => `
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html
  data-source-file="emails/scoreboard-signin.tsx"
  data-source-line="19"
  dir="ltr"
  lang="en">
  <head data-source-file="emails/scoreboard-signin.tsx" data-source-line="20">
    <meta content="text/html; charset=UTF-8" http-equiv="Content-Type" />
    <meta name="x-apple-disable-message-reformatting" />
    <style
      data-source-file="emails/scoreboard-signin.tsx"
      data-source-line="21">
      @media only screen and (max-width: 600px) {
        .mobile-padding { padding: 20px !important; }
        .mobile-header-padding { padding: 24px 20px !important; }
        .mobile-content-padding { padding: 24px 20px !important; }
        .mobile-footer-padding { padding: 24px 20px !important; }
        .mobile-code-padding { padding: 16px !important; }
        .mobile-code-font { font-size: 24px !important; letter-spacing: 4px !important; }
        .mobile-heading { font-size: 24px !important; }
        .mobile-text { font-size: 14px !important; }
        .mobile-greeting { font-size: 16px !important; }
      }
    </style>
  </head>
  <body
    data-source-file="emails/scoreboard-signin.tsx"
    data-source-line="36"
    style="background-color:#f8fafc">
    <!--$-->
    <div
      style="display:none;overflow:hidden;line-height:1px;opacity:0;max-height:0;max-width:0"
      data-skip-in-text="true"
      data-source-file="emails/scoreboard-signin.tsx"
      data-source-line="35">
      Sign in code: ${token}
      <div>
      </div>
    </div>
    <table
      border="0"
      width="100%"
      cellpadding="0"
      cellspacing="0"
      role="presentation"
      align="center">
      <tbody>
        <tr>
          <td
            style="background-color:#f8fafc;font-family:-apple-system, BlinkMacSystemFont, &#x27;Segoe UI&#x27;, &#x27;Roboto&#x27;, &#x27;Oxygen&#x27;, &#x27;Ubuntu&#x27;, &#x27;Cantarell&#x27;, &#x27;Fira Sans&#x27;, &#x27;Droid Sans&#x27;, &#x27;Helvetica Neue&#x27;, sans-serif;padding:40px 20px;width:100%">
            <table
              align="center"
              width="100%"
              data-source-file="emails/scoreboard-signin.tsx"
              data-source-line="37"
              border="0"
              cellpadding="0"
              cellspacing="0"
              role="presentation"
              style="max-width:600px;margin:0 auto;width:100%">
              <tbody>
                <tr style="width:100%">
                  <td>
                    <table
                      align="center"
                      width="100%"
                      border="0"
                      cellpadding="0"
                      cellspacing="0"
                      role="presentation"
                      data-source-file="emails/scoreboard-signin.tsx"
                      data-source-line="38"
                      style="background-color:#ffffff;border-radius:16px;box-shadow:0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);overflow:hidden;border:1px solid #7b7f8533;width:100%;max-width:600px">
                      <tbody>
                        <tr>
                          <td>
                            <div
                              style="background-color:#0f172a;padding:32px 40px;text-align:center"
                              class="mobile-header-padding"
                              data-source-file="emails/scoreboard-signin.tsx"
                              data-source-line="39">
                              <div
                                style="background-color:#3b82f6;border-radius:12px;color:#ffffff;display:inline-block;font-size:24px;font-weight:bold;height:48px;line-height:48px;margin-bottom:16px;text-align:center;width:48px"
                                data-source-file="emails/scoreboard-signin.tsx"
                                data-source-line="40">
                                S
                              </div>
                              <h1
                                class="mobile-heading"
                                data-source-file="emails/scoreboard-signin.tsx"
                                data-source-line="41"
                                style="color:#ffffff;font-family:-apple-system, BlinkMacSystemFont, &#x27;Segoe UI&#x27;, &#x27;Roboto&#x27;, &#x27;Oxygen&#x27;, &#x27;Ubuntu&#x27;, &#x27;Cantarell&#x27;, &#x27;Fira Sans&#x27;, &#x27;Droid Sans&#x27;, &#x27;Helvetica Neue&#x27;, sans-serif;font-size:28px;font-weight:700;margin:0;text-align:center">
                                Sign in to Scoreboard
                              </h1>
                            </div>
                            <table
                              align="center"
                              width="100%"
                              border="0"
                              cellpadding="0"
                              cellspacing="0"
                              role="presentation"
                              class="mobile-content-padding"
                              data-source-file="emails/scoreboard-signin.tsx"
                              data-source-line="46"
                              style="padding:40px">
                              <tbody>
                                <tr>
                                  <td>
                                    <p
                                      class="mobile-greeting"
                                      data-source-file="emails/scoreboard-signin.tsx"
                                      data-source-line="47"
                                      style="font-size:18px;line-height:28px;color:#1e293b;font-family:-apple-system, BlinkMacSystemFont, &#x27;Segoe UI&#x27;, &#x27;Roboto&#x27;, &#x27;Oxygen&#x27;, &#x27;Ubuntu&#x27;, &#x27;Cantarell&#x27;, &#x27;Fira Sans&#x27;, &#x27;Droid Sans&#x27;, &#x27;Helvetica Neue&#x27;, sans-serif;font-weight:500;margin:0 0 24px 0;margin-top:0;margin-right:0;margin-bottom:24px;margin-left:0">
                                      Hi ${email},
                                    </p>
                                    <p
                                      class="mobile-text"
                                      data-source-file="emails/scoreboard-signin.tsx"
                                      data-source-line="50"
                                      style="font-size:16px;line-height:26px;color:#475569;font-family:-apple-system, BlinkMacSystemFont, &#x27;Segoe UI&#x27;, &#x27;Roboto&#x27;, &#x27;Oxygen&#x27;, &#x27;Ubuntu&#x27;, &#x27;Cantarell&#x27;, &#x27;Fira Sans&#x27;, &#x27;Droid Sans&#x27;, &#x27;Helvetica Neue&#x27;, sans-serif;margin:0 0 32px 0;margin-top:0;margin-right:0;margin-bottom:32px;margin-left:0">
                                      Use the following code to sign in to your
                                      Scoreboard account
                                    </p>
                                    <table
                                      align="center"
                                      width="100%"
                                      border="0"
                                      cellpadding="0"
                                      cellspacing="0"
                                      role="presentation"
                                      class="mobile-code-padding"
                                      data-source-file="emails/scoreboard-signin.tsx"
                                      data-source-line="54"
                                      style="background-color:#f8fafc;border-radius:12px;margin:32px 0;padding:24px">
                                      <tbody>
                                        <tr>
                                          <td>
                                            <div
                                              style="text-align:center"
                                              data-source-file="emails/scoreboard-signin.tsx"
                                              data-source-line="55">
                                              <p
                                                class="mobile-code-font"
                                                data-source-file="emails/scoreboard-signin.tsx"
                                                data-source-line="56"
                                                style='font-size:32px;line-height:24px;background-color:#ffffff;border:2px solid #7b7f8533;border-radius:12px;color:#0f172a;display:inline-block;font-family:"SF Mono", "Monaco", "Inconsolata", "Roboto Mono", "Source Code Pro", monospace;font-weight:700;letter-spacing:8px;margin:0;padding:24px 32px;text-align:center;box-shadow:0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);word-break:break-all;max-width:100%;margin-top:0;margin-bottom:0;margin-left:0;margin-right:0'>
                                                ${token}
                                              </p>
                                            </div>
                                          </td>
                                        </tr>
                                      </tbody>
                                    </table>
                                    <p
                                      class="mobile-text"
                                      data-source-file="emails/scoreboard-signin.tsx"
                                      data-source-line="62"
                                      style="font-size:14px;line-height:22px;background-color:#fef3c7;border:1px solid #f59e0b;border-radius:8px;color:#92400e;font-family:-apple-system, BlinkMacSystemFont, &#x27;Segoe UI&#x27;, &#x27;Roboto&#x27;, &#x27;Oxygen&#x27;, &#x27;Ubuntu&#x27;, &#x27;Cantarell&#x27;, &#x27;Fira Sans&#x27;, &#x27;Droid Sans&#x27;, &#x27;Helvetica Neue&#x27;, sans-serif;margin:32px 0 0 0;padding:16px;margin-top:32px;margin-right:0;margin-bottom:0;margin-left:0">
                                      This code will expire in
                                      <strong
                                        data-source-file="emails/scoreboard-signin.tsx"
                                        data-source-line="63"
                                        >15 minutes</strong
                                      >. If you didn&#x27;t request this code,
                                      you can safely ignore this email.
                                    </p>
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                            <table
                              align="center"
                              width="100%"
                              border="0"
                              cellpadding="0"
                              cellspacing="0"
                              role="presentation"
                              class="mobile-footer-padding"
                              data-source-file="emails/scoreboard-signin.tsx"
                              data-source-line="68"
                              style="background-color:#f8fafc;border-top:1px solid #7b7f8533;padding:32px 40px">
                              <tbody>
                                <tr>
                                  <td>
                                    <p
                                      class="mobile-text"
                                      data-source-file="emails/scoreboard-signin.tsx"
                                      data-source-line="69"
                                      style="font-size:14px;line-height:22px;color:#64748b;font-family:-apple-system, BlinkMacSystemFont, &#x27;Segoe UI&#x27;, &#x27;Roboto&#x27;, &#x27;Oxygen&#x27;, &#x27;Ubuntu&#x27;, &#x27;Cantarell&#x27;, &#x27;Fira Sans&#x27;, &#x27;Droid Sans&#x27;, &#x27;Helvetica Neue&#x27;, sans-serif;margin:0;text-align:center;margin-top:0;margin-bottom:0;margin-left:0;margin-right:0">
                                      <strong
                                        data-source-file="emails/scoreboard-signin.tsx"
                                        data-source-line="70"
                                        >The Scoreboard Team</strong
                                      >
                                    </p>
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </td>
                </tr>
              </tbody>
            </table>
          </td>
        </tr>
      </tbody>
    </table>
    <!--7--><!--/$-->
  </body>
</html>

`;

export const ResendOTP = Email({
  id: "resend-otp",
  apiKey: process.env.AUTH_RESEND_KEY,
  maxAge: 60 * 15, // 15 minutes
  async generateVerificationToken() {
    const random: RandomReader = {
      read(bytes) {
        crypto.getRandomValues(bytes);
      },
    };

    const alphabet = "0123456789";
    const length = 4;
    return generateRandomString(random, alphabet, length);
  },
  async sendVerificationRequest({ identifier: email, provider, token }) {
    // Use fetch instead of Resend SDK to avoid React Email dependencies
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${provider.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Scoreboard <scoreboard@theom.app>",
        to: [email],
        subject: "Sign in to Scoreboard",
        html: createSignInEmailHtml(token, email),
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to send email: ${error}`);
    }
  },
});
