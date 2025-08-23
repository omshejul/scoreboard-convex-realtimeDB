import { useAuthActions } from "@convex-dev/auth/react";
import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function SignIn() {
  const { signIn } = useAuthActions();
  const [step, setStep] = useState<"signIn" | { email: string }>("signIn");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEmailSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData(event.currentTarget);
      const email = formData.get("email") as string;

      if (!email || !email.includes("@")) {
        throw new Error("Please enter a valid email address");
      }

      await signIn("resend-otp", formData);
      setStep({ email });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send code");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCodeSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData(event.currentTarget);
      const code = formData.get("code") as string;

      if (!code || code.length !== 4) {
        throw new Error("Please enter a complete 4-digit code");
      }

      await signIn("resend-otp", formData);
    } catch (err) {
      // Handle specific Convex Auth errors
      if (err instanceof Error) {
        if (
          err.message.includes("Could not verify code") ||
          err.message.includes("verification")
        ) {
          setError("Invalid verification code. Please check and try again.");
        } else if (err.message.includes("expired")) {
          setError("Verification code has expired. Please request a new one.");
        } else {
          setError(err.message);
        }
      } else {
        setError("Invalid verification code. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-lg/5 border border-neutral-400/30 overflow-hidden">
          <div className="px-8 py-10">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-center mb-8"
            >
              <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
                Welcome to Scoreboard
              </h1>
              <p className="text-neutral-600 dark:text-neutral-400">
                {step === "signIn"
                  ? "Enter your email to get started"
                  : "Check your email for the code"}
              </p>
            </motion.div>

            <AnimatePresence mode="wait">
              {step === "signIn" ? (
                <EmailForm
                  key="email"
                  onSubmit={handleEmailSubmit}
                  isLoading={isLoading}
                  error={error}
                />
              ) : (
                <CodeForm
                  key="code"
                  email={step.email}
                  onSubmit={handleCodeSubmit}
                  onBack={() => setStep("signIn")}
                  isLoading={isLoading}
                  error={error}
                />
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function EmailForm({
  onSubmit,
  isLoading,
  error,
}: {
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  isLoading: boolean;
  error: string | null;
}) {
  return (
    <motion.form
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      onSubmit={onSubmit}
      className="space-y-6"
    >
      <div>
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
          className="w-full px-4 text-black dark:text-neutral-100 py-3 border border-neutral-300 dark:border-neutral-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          placeholder="Enter your email"
        />
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 bg-red-50 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 text-sm"
        >
          {error}
        </motion.div>
      )}

      <motion.button
        type="submit"
        disabled={isLoading}
        whileTap={{ scale: 0.98 }}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:cursor-not-allowed flex items-center justify-center"
      >
        {isLoading ? (
          <>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"
            />
            Sending code...
          </>
        ) : (
          "Send verification code"
        )}
      </motion.button>
    </motion.form>
  );
}

function CodeForm({
  email,
  onSubmit,
  onBack,
  isLoading,
  error,
}: {
  email: string;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  onBack: () => void;
  isLoading: boolean;
  error: string | null;
}) {
  const { signIn } = useAuthActions();
  const [isResending, setIsResending] = useState(false);

  const handleResendCode = async () => {
    setIsResending(true);
    try {
      const formData = new FormData();
      formData.append("email", email);
      await signIn("resend-otp", formData);
    } catch (err) {
      console.error("Failed to resend code:", err);
    } finally {
      setIsResending(false);
    }
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
            {email}
          </span>
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-6">
        <div>
          <label
            htmlFor="code"
            className="block text-lg font-bold text-center text-neutral-700 dark:text-neutral-300 mb-3"
          >
            Verification code
          </label>
          <OTPInput disabled={isLoading} />
        </div>

        <input name="email" value={email} type="hidden" />

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm"
          >
            {error}
          </motion.div>
        )}

        <div className="space-y-3">
          <motion.button
            type="submit"
            disabled={isLoading}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isLoading ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"
                />
                Verifying...
              </>
            ) : (
              "Verify code"
            )}
          </motion.button>

          <div className="flex gap-3">
            <motion.button
              type="button"
              onClick={handleResendCode}
              disabled={isLoading || isResending}
              whileTap={{ scale: 0.98 }}
              className="flex-1 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 disabled:opacity-50 text-neutral-700 dark:text-neutral-300 font-medium py-3 px-4 rounded-lg transition-colors disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isResending ? "Sending..." : "Resend code"}
            </motion.button>

            <motion.button
              type="button"
              onClick={onBack}
              disabled={isLoading}
              whileTap={{ scale: 0.98 }}
              className="flex-1 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 disabled:opacity-50 text-neutral-700 dark:text-neutral-300 font-medium py-3 px-4 rounded-lg transition-colors disabled:cursor-not-allowed"
            >
              Back to email
            </motion.button>
          </div>
        </div>
      </form>
    </motion.div>
  );
}
// MARK: OTPInput
function OTPInput({ disabled }: { disabled: boolean }) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) {
      // Handle paste
      const codes = value.slice(0, 4).split("");
      codes.forEach((code, i) => {
        if (inputRefs.current[i]) {
          inputRefs.current[i]!.value = code;
        }
      });
      // Set focus to the last filled input or the next empty one
      const nextIndex = Math.min(codes.length, 3);
      inputRefs.current[nextIndex]?.focus();
    } else if (value.length === 1) {
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
            className="w-10 h-10 text-black dark:text-neutral-100 text-center text-base font-mono font-bold border-2 border-neutral-300 dark:border-neutral-700 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          />
        ))}
      </div>
      <input name="code" type="hidden" />
      <p className="text-xs text-neutral-500 dark:text-neutral-400 text-center">
        Enter the 4-digit code from your email
      </p>
    </div>
  );
}
