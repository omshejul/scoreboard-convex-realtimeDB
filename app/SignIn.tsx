import { useAuthActions } from "@convex-dev/auth/react";
import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Spinner, ArrowLeft, PaperPlaneTilt, CheckCircle, XCircle, ArrowCounterClockwise } from "phosphor-react";

export function SignIn() {
  const { signIn } = useAuthActions();
  const [step, setStep] = useState<"signIn" | { email: string }>("signIn");
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [isVerifyingCode, setIsVerifyingCode] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendConfirmation, setResendConfirmation] = useState<boolean>(false);

  const handleEmailSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSendingCode(true);
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
      setIsSendingCode(false);
    }
  };

  const handleCodeSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsVerifyingCode(true);
    setError(null);

    try {
      const formData = new FormData(event.currentTarget);
      const code = formData.get("code") as string;

      if (!code || code.length !== 4) {
        throw new Error("Please enter a complete 4-digit code");
      }

      await signIn("resend-otp", formData);
      
      // Only set timeout on successful verification
      setTimeout(() => {
        setIsVerifyingCode(false);
      }, 5000);

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
          <div className="px-8 py-10">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-center mb-8"
            >
              <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
                <span className=" whitespace-nowrap">
                  Welcome to
                </span>{" "}
                <span className="text-blue-500 dark:text-blue-400 font-sans text-2xl ml-2 font-bold">
                  Scoreboard
                </span>
              </h1>
              <p className="text-neutral-600 dark:text-neutral-400">
                {step === "signIn"
                  ? ""
                  : "Check your email for the code"}
              </p>
            </motion.div>

            <AnimatePresence mode="wait">
              {step === "signIn" ? (
                <EmailForm
                  key="email"
                  onSubmit={handleEmailSubmit}
                  isLoading={isSendingCode}
                  error={error}
                />
              ) : (
                <CodeForm
                  key="code"
                  email={step.email}
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
          className="w-full px-4 text-black dark:text-neutral-100 py-3 border border-neutral-300 dark:border-neutral-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          placeholder="Enter your email"
        />
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

      <motion.button
        type="submit"
        disabled={isLoading}
        whileTap={{ scale: 0.98 }}
        className="w-full shadow-xl/5 bg-gradient-to-b from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:from-blue-400 disabled:to-blue-400 text-white font-medium py-3 px-4 rounded-xl transition-colors disabled:cursor-not-allowed flex items-center justify-center relative before:absolute before:inset-x-0 before:top-[3px] before:h-[3px] before:bg-white/20 before:blur-[3px] before:rounded-t-xl after:absolute after:inset-x-0 after:bottom-[3px] after:h-[3px] after:bg-black/20 after:blur-[3px] after:rounded-b-xl overflow-hidden"
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
      </motion.button>
    </motion.form>
  );
}

function CodeForm({
  email,
  onSubmit,
  onBack,
  isVerifying,
  error,
  setResendConfirmation,
  resendConfirmation,
}: {
  email: string;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  onBack: () => void;
  isVerifying: boolean;
  error: string | null;
  setResendConfirmation: React.Dispatch<React.SetStateAction<boolean>>;
  resendConfirmation: boolean;
}) {
  const { signIn } = useAuthActions();
  const [isResending, setIsResending] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const handleResendCode = async () => {
    setIsResending(true);
    try {
      const formData = new FormData();
      formData.append("email", email);
      await signIn("resend-otp", formData);
      setResendConfirmation(true);
      setTimeout(() => {
        setResendConfirmation(false);
      }, 3000);
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

        <input name="email" value={email} type="hidden" />

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
          <motion.button
            type="submit"
            disabled={isVerifying}
            whileTap={{ scale: 0.98 }}
            className="w-full shadow-xl/5 bg-gradient-to-b from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:from-blue-400 disabled:to-blue-400 text-white font-medium py-3 px-4 rounded-xl transition-colors disabled:cursor-not-allowed flex items-center justify-center relative before:absolute before:inset-x-0 before:top-[3px] before:h-[3px] before:bg-white/20 before:blur-[3px] before:rounded-t-xl after:absolute after:inset-x-0 after:bottom-[3px] after:h-[3px] after:bg-black/20 after:blur-[3px] after:rounded-b-xl overflow-hidden"
          >
            {isVerifying ? (
              <>
                <Spinner size={20} className="mr-2 animate-spin" />
                Verifying...
              </>
            ) : (
              "Verify code"
            )}
          </motion.button>

          <div className="flex gap-3 flex-wrap justify-center">
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

            <motion.button
              type="button"
              onClick={onBack}
              disabled={isVerifying}
              whileTap={{ scale: 0.98 }}
              className="flex-1 bg-neutral-100 whitespace-nowrap hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 disabled:opacity-50 text-neutral-700 dark:text-neutral-300 font-medium py-3 px-4 rounded-xl transition-colors disabled:cursor-not-allowed flex items-center justify-center border border-neutral-300 dark:border-neutral-700"
            >
              <ArrowLeft size={20} className="mr-2" />
              Back to email
            </motion.button>
          </div>
        </div>
      </form>
    </motion.div>
  );
}
// MARK: OTPInput
function OTPInput({ disabled, onComplete }: { disabled: boolean, onComplete: () => void }) {
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

    // Auto submit when all digits are filled
    if (code.length === 4) {
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
              className="w-10 h-10 text-black dark:text-neutral-100 text-center text-base font-mono font-bold border-2 border-neutral-300 dark:border-neutral-700 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            />
          ))}
        </AnimatePresence>
      </div>
      <input name="code" type="hidden" />
      <p className="text-xs text-neutral-500 dark:text-neutral-400 text-center">
        Enter the 4-digit code from your email
      </p>
    </div>
  );
}
