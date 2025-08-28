import { Email } from "@convex-dev/auth/providers/Email";
import { RandomReader, generateRandomString } from "@oslojs/crypto/random";

export const WhatsAppOTP = Email({
  id: "whatsapp-otp",
  maxAge: 60 * 15,
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
  async sendVerificationRequest({ identifier: phone, token }) {
    const url =
      process.env.WHATSAPP_API_URL ||
      "https://nodered.omshejul.com/api/v1/whatsapp/message";
    const bearer = process.env.WHATSAPP_BEARER || "XYZ";


    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${bearer}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        to: phone,
        body: `Your Scoreboard verification code is: ${token}`,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to send WhatsApp OTP: ${error}`);
    }
  },
});
