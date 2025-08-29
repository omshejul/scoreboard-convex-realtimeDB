import { useAuthActions } from "@convex-dev/auth/react";
import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Spinner,
  ArrowLeft,
  PaperPlaneTilt,
  CheckCircle,
  XCircle,
  ArrowCounterClockwise,
  EnvelopeSimple,
} from "phosphor-react";
import { PhoneInput } from "./PhoneInput";
import { FaWhatsapp } from "react-icons/fa";
import { useHapticFeedback } from "../lib/utils";
// MARK: SignIn Component
export function SignIn() {
  const { signIn } = useAuthActions();
  const haptic = useHapticFeedback();
  const [step, setStep] = useState<
    "signIn" | { method: "email" | "whatsapp"; identifier: string }
  >("signIn");
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [isVerifyingCode, setIsVerifyingCode] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendConfirmation, setResendConfirmation] = useState<boolean>(false);
  const [method, setMethod] = useState<"email" | "whatsapp">("email");
  const [phoneNumber, setPhoneNumber] = useState("");

  const handleEmailSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    haptic.medium(); // Haptic feedback on button press
    setIsSendingCode(true);
    setError(null);

    try {
      const raw = new FormData(event.currentTarget);

      if (method === "email") {
        const email = (raw.get("email") as string) || "";
        if (!email || !email.includes("@")) {
          throw new Error("Please enter a valid email address");
        }
        await signIn("resend-otp", raw);
        setStep({ method, identifier: email });
        haptic.success(); // Success haptic feedback when code is sent
      } else {
        if (!phoneNumber || !/^\+?[0-9]{8,15}$/.test(phoneNumber)) {
          throw new Error(
            "Enter a valid phone in E.164 format, e.g. +1234567890"
          );
        }
        const fd = new FormData();
        fd.append("email", phoneNumber);
        await signIn("whatsapp-otp", fd);
        setStep({ method, identifier: phoneNumber });
        haptic.success(); // Success haptic feedback when code is sent
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to send code";
      if (method === "whatsapp") {
        // Preserve client-side validation message
        if (message.toLowerCase().includes("enter a valid phone")) {
          setError(message);
        } else if (message.includes("Failed to send WhatsApp OTP")) {
          setError("Message could not be delivered.");
        } else {
          // Generic friendly message for WhatsApp delivery failures
          setError("Message could not be delivered.");
        }
      } else {
        setError(message);
      }
      haptic.error(); // Error haptic feedback on failure
    } finally {
      setIsSendingCode(false);
    }
  };

  const handleCodeSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    haptic.medium(); // Haptic feedback on button press
    setIsVerifyingCode(true);
    setError(null);

    try {
      const formData = new FormData(event.currentTarget);
      const code = formData.get("code") as string;

      if (!code || code.length !== 4) {
        throw new Error("Please enter a complete 4-digit code");
      }

      // Ensure the provider receives the identifier under the "email" key
      const identifier =
        step !== "signIn" ? step.identifier : formData.get("email");
      const fd = new FormData();
      fd.append("code", code);
      fd.append("email", String(identifier));

      await signIn(
        step !== "signIn" && step.method === "whatsapp"
          ? "whatsapp-otp"
          : "resend-otp",
        fd
      );

      haptic.success(); // Success haptic feedback on successful verification
      // Only set timeout on successful verification
      setTimeout(() => {
        setIsVerifyingCode(false);
      }, 5000);
    } catch (err) {
      // Handle specific Convex Auth errors
      const message =
        err instanceof Error
          ? err.message
          : "Invalid verification code. Please try again.";
      if (
        message.includes("Could not verify code") ||
        message.toLowerCase().includes("verification")
      ) {
        setError("Invalid verification code. Please check and try again.");
      } else if (message.toLowerCase().includes("expired")) {
        setError("Verification code has expired. Please request a new one.");
      } else if (message.includes("Failed to send WhatsApp OTP")) {
        // If for some reason a send error bubbles here, keep it friendly
        setError("Message could not be delivered.");
      } else {
        setError(message);
      }
      haptic.error(); // Error haptic feedback on verification failure
      // Immediately set verifying to false on error
      setIsVerifyingCode(false);
    }
  };

  return (
    <div className="min-h-svh font-plusJakartaSans flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="">
          <div className="px-4 md:px-8 py-10">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-center mb-8"
            >
              <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
                <span className=" whitespace-nowrap">Welcome to</span>{" "}
                <span className="bg-gradient-to-b bg-clip-text from-blue-500 to-blue-700 dark:from-blue-400 dark:to-blue-700 text-transparent font-sans text-2xl ml-2 font-bold px-2 py-1 rounded-md">
                  Scoreboard
                </span>
              </h1>
              <p className="text-neutral-600 dark:text-neutral-400">
                {step === "signIn"
                  ? ""
                  : step.method === "email"
                  ? "Check your email for the code"
                  : "Check your WhatsApp for the code"}
              </p>
            </motion.div>

            <AnimatePresence mode="wait">
              {step === "signIn" ? (
                <EmailForm
                  key="email"
                  onSubmit={handleEmailSubmit}
                  isLoading={isSendingCode}
                  error={error}
                  method={method}
                  setMethod={setMethod}
                  phoneNumber={phoneNumber}
                  setPhoneNumber={setPhoneNumber}
                />
              ) : (
                <CodeForm
                  key="code"
                  identifier={step.identifier}
                  method={step.method}
                  onSubmit={handleCodeSubmit}
                  onBack={() => setStep("signIn")}
                  isVerifying={isVerifyingCode}
                  error={error}
                  setResendConfirmation={setResendConfirmation}
                  resendConfirmation={resendConfirmation}
                />
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// MARK: EmailForm Component
function EmailForm({
  onSubmit,
  isLoading,
  error,
  method,
  setMethod,
  phoneNumber,
  setPhoneNumber,
}: {
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  isLoading: boolean;
  error: string | null;
  method: "email" | "whatsapp";
  setMethod: React.Dispatch<React.SetStateAction<"email" | "whatsapp">>;
  phoneNumber: string;
  setPhoneNumber: React.Dispatch<React.SetStateAction<string>>;
}) {
  const haptic = useHapticFeedback();

  const handleMethodChange = (newMethod: "email" | "whatsapp") => {
    haptic.light(); // Haptic feedback on method toggle
    setMethod(newMethod);
  };

  return (
    <motion.form
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      onSubmit={onSubmit}
      className="space-y-6"
    >
      <div className="flex gap-2 border border-neutral-200 dark:border-neutral-800 p-1 rounded-xl text-sm">
        <button
          type="button"
          onClick={() => handleMethodChange("email")}
          className={`flex-1 py-2 rounded-lg transition-colors flex items-center justify-center gap-2 ${
            method === "email"
              ? "bg-neutral-900 dark:bg-neutral-900 text-white dark:text-white"
              : "text-neutral-600 dark:text-neutral-400"
          }`}
        >
          <EnvelopeSimple size={16} />
          Email
        </button>
        <button
          type="button"
          onClick={() => handleMethodChange("whatsapp")}
          className={`flex-1 py-2 rounded-lg transition-colors flex items-center justify-center gap-2 ${
            method === "whatsapp"
              ? "bg-neutral-900 dark:bg-neutral-900 text-white dark:text-white"
              : "text-neutral-600 dark:text-neutral-400"
          }`}
        >
          <FaWhatsapp size={16} />
          WhatsApp
        </button>
      </div>
      <div>
        {method === "email" ? (
          <>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2"
            >
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              disabled={isLoading}
              className="w-full px-4 text-black dark:text-neutral-100 py-3 border border-neutral-300 dark:border-neutral-700 rounded-xl focus:outline-none focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              placeholder="Enter your email"
            />
          </>
        ) : (
          <>
            <label
              htmlFor="phone"
              className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2"
            >
              Phone Number
            </label>
            <PhoneInput
              value={phoneNumber}
              onChange={setPhoneNumber}
              placeholder="77799 77799"
              disabled={isLoading}
              className="w-full"
            />
          </>
        )}
      </div>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-300 text-sm flex items-center gap-2"
          >
            <XCircle size={16} />
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* MARK: EmailForm Submit Button */}
      <motion.button
        type="submit"
        disabled={isLoading}
        whileTap={{ scale: 0.98 }}
        className="w-full shadow-lg shadow-blue-500/20 hover bg-gradient-to-b from-blue-500 to-blue-600 group hover:from-blue-500 hover:to-blue-700 disabled:from-blue-400 disabled:to-blue-500 text-white font-medium p-1.5 rounded-xl transition-colors disabled:cursor-not-allowed flex items-center justify-center"
      >
        <div
          className={`w-full bg-gradient-to-t 
          ${
            isLoading
              ? "from-blue-400 to-blue-500"
              : "from-blue-500 to-blue-600 group-hover:from-blue-500 group-hover:to-blue-700"
          }    text-white font-medium py-3 px-4 rounded-full transition-all disabled:cursor-not-allowed flex items-center justify-center text-shadow-lg`}
        >
          {isLoading ? (
            <>
              <Spinner size={20} className="mr-2 animate-spin" />
              Sending code...
            </>
          ) : (
            <>
              <PaperPlaneTilt size={20} className="mr-2" />
              Send verification code
            </>
          )}
        </div>
      </motion.button>
    </motion.form>
  );
}

// MARK: CodeForm Component
function CodeForm({
  identifier,
  method,
  onSubmit,
  onBack,
  isVerifying,
  error,
  setResendConfirmation,
  resendConfirmation,
}: {
  identifier: string;
  method: "email" | "whatsapp";
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  onBack: () => void;
  isVerifying: boolean;
  error: string | null;
  setResendConfirmation: React.Dispatch<React.SetStateAction<boolean>>;
  resendConfirmation: boolean;
}) {
  const { signIn } = useAuthActions();
  const haptic = useHapticFeedback();
  const [isResending, setIsResending] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const handleResendCode = async () => {
    haptic.light(); // Haptic feedback on resend button press
    setIsResending(true);
    try {
      const formData = new FormData();
      formData.append("email", identifier);
      await signIn(
        method === "whatsapp" ? "whatsapp-otp" : "resend-otp",
        formData
      );
      haptic.success(); // Success haptic feedback when resend succeeds
      setResendConfirmation(true);
      setTimeout(() => {
        setResendConfirmation(false);
      }, 3000);
    } catch (err) {
      console.error("Failed to resend code:", err);
      haptic.error(); // Error haptic feedback when resend fails
    } finally {
      setIsResending(false);
    }
  };

  const handleBackClick = () => {
    haptic.light(); // Haptic feedback on back button press
    onBack();
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="text-center">
        <p className="text-sm text-neutral-600  dark:text-neutral-400 mb-6">
          We sent a verification code to{" "}
          <span className="font-medium text-neutral-900  dark:text-neutral-100">
            {identifier}
          </span>
        </p>
      </div>

      <form ref={formRef} onSubmit={onSubmit} className="space-y-6">
        <div>
          <label
            htmlFor="code"
            className="block text-lg font-bold text-center text-neutral-700 dark:text-neutral-300 mb-3"
          >
            Verification code
          </label>
          <OTPInput
            disabled={isVerifying}
            onComplete={() => formRef.current?.requestSubmit()}
          />
        </div>

        <input name="email" value={identifier} type="hidden" />

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-300 text-sm flex items-center gap-2"
            >
              <XCircle size={16} />
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {resendConfirmation && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-3 bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-800 rounded-xl text-green-700 dark:text-green-300 text-sm text-center flex items-center gap-2 justify-center"
            >
              <CheckCircle size={16} />
              Verification code resent!
            </motion.div>
          )}
        </AnimatePresence>

        <div className="space-y-3">
          {/* MARK: CodeForm Verify Button */}
          <motion.button
            type="submit"
            disabled={isVerifying}
            whileTap={{ scale: 0.98 }}
            className="w-full shadow-lg shadow-blue-500/20 bg-gradient-to-b from-blue-500 to-blue-600 group hover:from-blue-500 hover:to-blue-700 disabled:from-blue-400 disabled:to-blue-500 text-white font-medium p-1.5 rounded-xl transition-colors disabled:cursor-not-allowed flex items-center justify-center"
          >
            <div
              className={`w-full bg-gradient-to-t 
          ${
            isVerifying
              ? "from-blue-400 to-blue-500"
              : "from-blue-500 to-blue-600 group-hover:from-blue-500 group-hover:to-blue-700 "
          }   text-white font-medium py-3 px-4 rounded-full transition-all disabled:cursor-not-allowed flex items-center justify-center text-shadow-lg`}
            >
              {isVerifying ? (
                <>
                  <Spinner size={20} className="mr-2 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Verify code"
              )}
            </div>
          </motion.button>

          <div className="flex gap-3 flex-wrap justify-center">
            {/* MARK: CodeForm Resend Button */}
            <motion.button
              type="button"
              onClick={handleResendCode}
              disabled={isVerifying || isResending}
              whileTap={{ scale: 0.98 }}
              className="flex-1 bg-neutral-100 whitespace-nowrap hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 disabled:opacity-50 text-neutral-700 dark:text-neutral-300 font-medium py-3 px-4 rounded-xl transition-colors disabled:cursor-not-allowed flex items-center justify-center border border-neutral-300 dark:border-neutral-700"
            >
              {isResending ? (
                "Sending..."
              ) : (
                <>
                  <ArrowCounterClockwise size={16} className="mr-2" />
                  Resend code
                </>
              )}
            </motion.button>

            {/* MARK: CodeForm Back Button */}
            <motion.button
              type="button"
              onClick={handleBackClick}
              disabled={isVerifying}
              whileTap={{ scale: 0.98 }}
              className="flex-1 bg-neutral-100 whitespace-nowrap hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 disabled:opacity-50 text-neutral-700 dark:text-neutral-300 font-medium py-3 px-4 rounded-xl transition-colors disabled:cursor-not-allowed flex items-center justify-center border border-neutral-300 dark:border-neutral-700"
            >
              <ArrowLeft size={20} className="mr-2" />
              Back
            </motion.button>
          </div>
        </div>
      </form>
    </motion.div>
  );
}
// MARK: OTPInput Component
function OTPInput({
  disabled,
  onComplete,
}: {
  disabled: boolean;
  onComplete: () => void;
}) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const haptic = useHapticFeedback();

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) {
      // Handle paste
      const codes = value.slice(0, 4).split("");
      codes.forEach((code, i) => {
        if (inputRefs.current[i]) {
          inputRefs.current[i]!.value = code;
        }
      });
      haptic.light(); // Haptic feedback on paste
      // Set focus to the last filled input or the next empty one
      const nextIndex = Math.min(codes.length, 3);
      inputRefs.current[nextIndex]?.focus();
    } else if (value.length === 1) {
      haptic.light(); // Haptic feedback on digit entry
      // Move to next input
      if (index < 3) {
        inputRefs.current[index + 1]?.focus();
      }
    }

    // Update the hidden input
    const code = inputRefs.current.map((ref) => ref?.value || "").join("");
    const hiddenInput = document.querySelector(
      'input[name="code"]'
    ) as HTMLInputElement;
    if (hiddenInput) {
      hiddenInput.value = code;
    }

    // Auto submit when all digits are filled
    if (code.length === 4) {
      haptic.medium(); // Stronger haptic feedback when complete
      onComplete();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (
      e.key === "Backspace" &&
      !inputRefs.current[index]?.value &&
      index > 0
    ) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2 justify-center">
        <AnimatePresence>
          {Array.from({ length: 4 }, (_, i) => (
            <motion.input
              key={i}
              ref={(el) => {
                inputRefs.current[i] = el;
              }}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={4} // Allow paste
              disabled={disabled}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              onFocus={(e) => e.target.select()}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="w-10 h-10 text-black dark:text-neutral-100 text-center text-base font-mono font-bold border-2 border-neutral-300 dark:border-neutral-700 rounded-xl focus:outline-none focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            />
          ))}
        </AnimatePresence>
      </div>
      <input name="code" type="hidden" />
      <p className="text-xs text-neutral-500 dark:text-neutral-400 text-center">
        Enter the 4-digit code
      </p>
    </div>
  );
}
