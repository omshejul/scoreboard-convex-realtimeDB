"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { Authenticated, Unauthenticated } from "convex/react";
import { SignIn } from "./SignIn";
import { Minus, ArrowClockwise } from "phosphor-react";

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

  // Generate user-specific slug using user ID - no fallback, user must be authenticated
  const userSlug = currentUser?.tokenIdentifier
    ? `user-${currentUser.tokenIdentifier}`
    : null;

  const scoreboard = useQuery(
    api.scoreboard.get,
    userSlug ? { slug: userSlug } : "skip"
  );

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
  const increment = useMutation(api.scoreboard.increment);
  const decrement = useMutation(api.scoreboard.decrement);
  const reset = useMutation(api.scoreboard.reset);

  // Optimistic state for instant UI updates
  const [optimisticLeft, setOptimisticLeft] = useState<number | null>(null);
  const [optimisticRight, setOptimisticRight] = useState<number | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

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
    if (!userSlug) return;

    // Optimistically update the UI immediately
    if (side === "left") {
      setOptimisticLeft((scoreboard.left ?? 0) + 1);
    } else {
      setOptimisticRight((scoreboard.right ?? 0) + 1);
    }

    // Then send the mutation to the server
    increment({ slug: userSlug, side });
  };

  const handleDecrement = async (side: "left" | "right") => {
    if (!userSlug) return;

    // Prevent going below 0
    const currentValue = side === "left" ? left : right;
    if (currentValue <= 0) return;

    // Optimistically update the UI immediately
    if (side === "left") {
      setOptimisticLeft(Math.max(0, (scoreboard.left ?? 0) - 1));
    } else {
      setOptimisticRight(Math.max(0, (scoreboard.right ?? 0) - 1));
    }

    // Then send the mutation to the server
    decrement({ slug: userSlug, side });
  };

  const handleReset = async () => {
    if (!userSlug) return;

    // Optimistically reset the UI immediately
    setOptimisticLeft(0);
    setOptimisticRight(0);

    // Then send the mutation to the server
    reset({ slug: userSlug });
    setShowResetConfirm(false);
  };

  return (
    <div className="grid grid-cols-2 h-full w-full overflow-hidden">
      <div className="relative border-r border-black/20">
        <button
          onClick={() => handleIncrement("left")}
          className="bg-red-500 w-full h-full flex flex-col items-center justify-center gap-3"
        >
          <AnimatePresence mode="wait">
            <motion.span
              key={left}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="font-bold tracking-tight"
              style={{ fontSize: "10rem" }}
            >
              {left}
            </motion.span>
          </AnimatePresence>
          <span className="text-sm tracking-widest">LEFT</span>
        </button>

        {left > 0 && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={(e) => {
              e.stopPropagation();
              handleDecrement("left");
            }}
            whileTap={{ scale: 0.9 }}
            className="absolute top-[8vh] left-1/2 transform -translate-x-1/2 w-16 h-16 rounded-full bg-black/20 border border-neutral-500/20 text-white text-sm font-bold flex items-center justify-center shadow-lg"
          >
            <Minus size={32} weight="bold" />
          </motion.button>
        )}

        {/* Reset button - bottom left */}
        <motion.button
          onClick={() => setShowResetConfirm(true)}
          whileTap={{ scale: 0.9 }}
          className="absolute bottom-4 left-4 w-12 h-12 rounded-full bg-black/50 border border-neutral-500/30 text-white text-xs font-bold flex items-center justify-center shadow-lg"
        >
          <ArrowClockwise size={20} weight="bold" />
        </motion.button>
      </div>

      <div className="relative">
        <button
          onClick={() => handleIncrement("right")}
          className="bg-blue-500 w-full h-full flex flex-col items-center justify-center gap-3"
        >
          <AnimatePresence mode="wait">
            <motion.span
              key={right}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="font-bold tracking-tight"
              style={{ fontSize: "10rem" }}
            >
              {right}
            </motion.span>
          </AnimatePresence>
          <span className="text-sm tracking-widest">RIGHT</span>
        </button>

        {right > 0 && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={(e) => {
              e.stopPropagation();
              handleDecrement("right");
            }}
            whileTap={{ scale: 0.9 }}
            className="absolute top-[8vh] left-1/2 transform -translate-x-1/2 w-16 h-16 rounded-full bg-black/20 border border-neutral-500/20 text-white text-sm font-bold flex items-center justify-center shadow-lg"
          >
            <Minus size={32} weight="bold" />
          </motion.button>
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
              className="bg-white rounded-xl shadow-lg border max-w-md w-full p-6"
            >
              <div className="flex flex-col space-y-2 text-center sm:text-left">
                <h2 className="text-lg text-black font-semibold">
                  Reset scoreboard?
                </h2>
                <p className="text-sm text-slate-600">
                  This will reset both scores to zero. This action cannot be
                  undone.
                </p>
              </div>

              <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 mt-6 space-y-2 space-y-reverse sm:space-y-0">
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowResetConfirm(false)}
                  className="inline-flex items-center justify-center rounded-lg text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={handleReset}
                  className="text-white border border-red-500 bg-red-500 inline-flex items-center justify-center rounded-lg text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-destructive text-destructive-foreground hover:bg-destructive/90 h-10 px-4 py-2"
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
