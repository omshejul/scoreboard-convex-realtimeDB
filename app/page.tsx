"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { Authenticated, Unauthenticated } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { SignIn } from "./SignIn";
import { Minus, ArrowClockwise } from "phosphor-react";

import SnapDrag from "./SnapDrag";

export default function Home() {
  return (
    <>
      <Unauthenticated>
        <SignIn />
      </Unauthenticated>
      <Authenticated>
        <Scoreboard />
      </Authenticated>
    </>
  );
}

function Scoreboard() {
  const currentUser = useQuery(api.auth.currentUser);
  const parentRefLeft = useRef<HTMLDivElement>(null);
  const parentRefRight = useRef<HTMLDivElement>(null);
  const { signOut } = useAuthActions();

  // Fetch scoreboard derived on the server from the authenticated user
  const scoreboard = useQuery(api.scoreboard.getForCurrentUser, {});

  // Fix iOS viewport glitches on orientation change
  useEffect(() => {
    const handleResize = () => {
      // Force viewport height recalculation
      document.documentElement.style.setProperty(
        "--vh",
        `${window.innerHeight * 0.01}px`
      );
    };

    const handleOrientationChange = () => {
      // Delay to allow iOS to finish transition
      setTimeout(() => {
        handleResize();
        // Force a repaint
        document.body.style.height = "100dvh";
      }, 100);
    };

    // Set initial viewport height
    handleResize();

    // Listen for resize and orientation changes
    window.addEventListener("resize", handleResize);
    window.addEventListener("orientationchange", handleOrientationChange);

    // iOS-specific viewport fix
    if (
      typeof window !== "undefined" &&
      /iPad|iPhone|iPod/.test(navigator.userAgent)
    ) {
      window.addEventListener("load", handleResize);
      document.addEventListener("touchstart", handleResize, { passive: true });
    }

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", handleOrientationChange);
      if (
        typeof window !== "undefined" &&
        /iPad|iPhone|iPod/.test(navigator.userAgent)
      ) {
        window.removeEventListener("load", handleResize);
        document.removeEventListener("touchstart", handleResize);
      }
    };
  }, []);
  const increment = useMutation(api.scoreboard.incrementForCurrentUser);
  const decrement = useMutation(api.scoreboard.decrementForCurrentUser);
  const reset = useMutation(api.scoreboard.resetForCurrentUser);

  // Optimistic state for instant UI updates
  const [optimisticLeft, setOptimisticLeft] = useState<number | null>(null);
  const [optimisticRight, setOptimisticRight] = useState<number | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  console.log("[SCOREBOARD]", scoreboard);

  // Reset optimistic state when server data changes
  useEffect(() => {
    if (scoreboard !== undefined) {
      setOptimisticLeft(null);
      setOptimisticRight(null);
    }
  }, [scoreboard]);

  //Loading state while the query connects
  if (scoreboard === undefined) {
    return (
      <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
        <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
          <div className="flex items-center justify-center h-screen">
            <span className="text-lg">Connecting…</span>
          </div>
        </main>
      </div>
    );
  }

  // Use optimistic values if available, otherwise use server values
  const left = optimisticLeft ?? scoreboard.left ?? 0;
  const right = optimisticRight ?? scoreboard.right ?? 0;

  const handleIncrement = async (side: "left" | "right") => {
    if (isUpdating) return;

    setIsUpdating(true);

    // Optimistically update the UI immediately
    if (side === "left") {
      setOptimisticLeft((scoreboard?.left ?? 0) + 1);
    } else {
      setOptimisticRight((scoreboard?.right ?? 0) + 1);
    }

    try {
      // Then send the mutation to the server
      await increment({ side });
    } catch (error) {
      console.error("Failed to increment:", error);
      // Reset optimistic state on error
      setOptimisticLeft(null);
      setOptimisticRight(null);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDecrement = async (side: "left" | "right") => {
    if (isUpdating) return;

    // Prevent going below 0
    const currentValue = side === "left" ? left : right;
    if (currentValue <= 0) return;

    setIsUpdating(true);

    // Optimistically update the UI immediately
    if (side === "left") {
      setOptimisticLeft(Math.max(0, (scoreboard?.left ?? 0) - 1));
    } else {
      setOptimisticRight(Math.max(0, (scoreboard?.right ?? 0) - 1));
    }

    try {
      // Then send the mutation to the server
      await decrement({ side });
    } catch (error) {
      console.error("Failed to decrement:", error);
      // Reset optimistic state on error
      setOptimisticLeft(null);
      setOptimisticRight(null);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleReset = async () => {
    if (isUpdating) return;

    setIsUpdating(true);

    // Optimistically reset the UI immediately
    setOptimisticLeft(0);
    setOptimisticRight(0);

    try {
      // Then send the mutation to the server
      await reset({});
      setShowResetConfirm(false);
    } catch (error) {
      console.error("Failed to reset:", error);
      // Reset optimistic state on error
      setOptimisticLeft(null);
      setOptimisticRight(null);
    } finally {
      setIsUpdating(false);
      setShowResetConfirm(false);
    }
  };

  return (
    <div className="grid grid-cols-2 h-full w-full overflow-hidden font-plusJakartaSans">
      <div className="relative border-r border-black/20" ref={parentRefLeft}>
        <button
          onClick={() => handleIncrement("left")}
          className="bg-red-500 cursor-n-resize w-full h-full flex flex-col items-center justify-center gap-3"
        >
          <AnimatePresence mode="wait">
            <motion.span
              key={left}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-white font-bold font-sans tracking-tight"
              style={{ fontSize: "20vw" }}
            >
              {left}
            </motion.span>
          </AnimatePresence>
          <span className="text-sm font-mono tracking-widest -translate-y-[150%]">
            LEFT
          </span>
        </button>

        {left > 0 && (
          <SnapDrag
            parentRef={parentRefLeft}
            inset={16}
            storageKey={`left-decrement-btn-corner`}
            allowedCorners={["top-left", "top-right", "bottom-right"]}
            className="w-16 h-16"
          >
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onTap={(e) => {
                e.stopPropagation();
                handleDecrement("left");
              }}
              whileTap={{ scale: 0.9 }}
              className="absolute w-16 h-16 rounded-full bg-black/20 border border-neutral-500/20 text-white text-sm font-bold flex items-center justify-center shadow-lg cursor-s-resize"
            >
              <Minus size={32} weight="bold" />
            </motion.button>
          </SnapDrag>
        )}

        {/* Reset button - bottom left */}
        <motion.button
          onClick={() => setShowResetConfirm(true)}
          whileTap={{ scale: 0.9 }}
          className="absolute bottom-4 left-4 w-12 h-12 rounded-full bg-black/40 border border-neutral-500/40 text-white text-xs font-bold flex items-center justify-center shadow-lg"
        >
          <ArrowClockwise size={20} weight="bold" />
        </motion.button>
      </div>

      <div className="relative" ref={parentRefRight}>
        <button
          onClick={() => handleIncrement("right")}
          className="bg-blue-500 cursor-n-resize w-full h-full flex flex-col items-center justify-center gap-3"
        >
          <AnimatePresence mode="wait">
            <motion.span
              key={right}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-white font-bold font-sans tracking-tight"
              style={{ fontSize: "20vw" }}
            >
              {right}
            </motion.span>
          </AnimatePresence>
          <span className="text-sm font-mono tracking-widest -translate-y-[150%]">
            RIGHT
          </span>
        </button>

        {right > 0 && (
          <SnapDrag
            parentRef={parentRefRight}
            inset={16}
            storageKey={`right-decrement-btn-corner`}
            allowedCorners={[
              "top-left",
              "top-right",
              "bottom-right",
              "bottom-left",
            ]}
            className="w-16 h-16"
          >
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onTap={(e) => {
                e.stopPropagation();
                handleDecrement("right");
              }}
              whileTap={{ scale: 0.9 }}
              className="absolute w-16 h-16 rounded-full bg-black/20 border border-neutral-500/20 text-white text-sm font-bold flex items-center justify-center shadow-lg cursor-s-resize"
            >
              <Minus size={32} weight="bold" />
            </motion.button>
          </SnapDrag>
        )}
      </div>

      {/* Reset Confirmation Dialog */}
      <AnimatePresence>
        {showResetConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowResetConfirm(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-neutral-900 rounded-xl shadow-lg border border-neutral-200 dark:border-neutral-800 max-w-md w-full p-6"
            >
              <div className="flex flex-col space-y-2 text-center sm:text-left">
                <div className="flex justify-between">
                  <h2 className="text-lg text-black dark:text-white font-semibold">
                    Reset scoreboard?
                  </h2>
                  <div className="flex justify-end mb-4">
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => signOut()}
                      className="text-sm px-3 py-1.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors flex items-center gap-1 font-medium"
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M16 17L21 12M21 12L16 7M21 12H9M9 3H7.8C6.11984 3 5.27976 3 4.63803 3.32698C4.07354 3.6146 3.6146 4.07354 3.32698 4.63803C3 5.27976 3 6.11984 3 7.8V16.2C3 17.8802 3 18.7202 3.32698 19.362C3.6146 19.9265 4.07354 20.3854 4.63803 20.673C5.27976 21 6.11984 21 7.8 21H9"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      Sign out
                    </motion.button>
                  </div>
                </div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  This will reset both scores to zero. This action cannot be
                  undone.
                </p>
              </div>

              <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 mt-6 space-y-2 space-y-reverse sm:space-y-0">
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowResetConfirm(false)}
                  className="inline-flex items-center justify-center rounded-lg text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-neutral-200 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 h-10 px-4 py-2"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={handleReset}
                  className="text-white border border-red-500 bg-red-500 dark:bg-red-600 dark:border-red-700 inline-flex items-center justify-center rounded-lg text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-destructive text-destructive-foreground hover:bg-destructive/90 h-10 px-4 py-2"
                >
                  Reset
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
