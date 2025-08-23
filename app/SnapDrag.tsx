"use client";

import {
  ReactNode,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { motion, useAnimation } from "motion/react";

type Corner = "top-left" | "top-right" | "bottom-left" | "bottom-right";

const ALL_CORNERS: Corner[] = [
  "top-left",
  "top-right",
  "bottom-left",
  "bottom-right",
];

type SnapDragProps = {
  parentRef: React.RefObject<HTMLDivElement | null>;
  className?: string;
  children: ReactNode;
  /**
   * Optional inset (in px) to keep the element away from the parent's edges
   * when snapping. Defaults to 0.
   */
  inset?: number;
  /**
   * Corner to snap to on mount. Defaults to "top-left".
   */
  initialCorner?: Corner;
  /**
   * Restrict snapping to these corners. Defaults to all four.
   */
  allowedCorners?: ReadonlyArray<Corner>;
  /**
   * Persist last snapped corner. If provided, the component will remember and
   * restore the last corner across unmounts using localStorage.
   */
  storageKey?: string;
};

export default function SnapDrag({
  parentRef,
  className = "",
  children,
  inset = 0,
  initialCorner = "top-left",
  allowedCorners = ["top-left", "top-right", "bottom-left", "bottom-right"],
  storageKey,
}: SnapDragProps) {
  const boxRef = useRef<HTMLDivElement>(null);
  const controls = useAnimation();
  const [currentCorner, setCurrentCorner] = useState<Corner | null>(null);

  const getSnapBounds = useCallback(
    (parent: DOMRect, el: DOMRect, elNode: HTMLElement) => {
      const styles = window.getComputedStyle(elNode);
      const marginLeft = parseFloat(styles.marginLeft || "0") || 0;
      const marginRight = parseFloat(styles.marginRight || "0") || 0;
      const marginTop = parseFloat(styles.marginTop || "0") || 0;
      const marginBottom = parseFloat(styles.marginBottom || "0") || 0;

      const minX = inset + marginLeft;
      const maxX = Math.max(
        minX,
        parent.width - el.width - inset - marginRight
      );
      const minY = inset + marginTop;
      const maxY = Math.max(
        minY,
        parent.height - el.height - inset - marginBottom
      );

      return { minX, maxX, minY, maxY };
    },
    [inset]
  );

  const computeXYForCorner = useCallback(
    (
      corner: Corner,
      bounds: { minX: number; maxX: number; minY: number; maxY: number }
    ) => {
      const { minX, maxX, minY, maxY } = bounds;
      switch (corner) {
        case "top-right":
          return { x: maxX, y: minY };
        case "bottom-left":
          return { x: minX, y: maxY };
        case "bottom-right":
          return { x: maxX, y: maxY };
        case "top-left":
        default:
          return { x: minX, y: minY };
      }
    },
    []
  );

  const resnapToCorner = useCallback(
    (corner: Corner, instant = true) => {
      const parent = parentRef.current;
      const el = boxRef.current;
      if (!parent || !el) return;

      const p = parent.getBoundingClientRect();
      const e = el.getBoundingClientRect();
      const bounds = getSnapBounds(p, e, el);

      const allowed: ReadonlyArray<Corner> =
        allowedCorners && allowedCorners.length > 0
          ? allowedCorners
          : ALL_CORNERS;

      const cornerToUse: Corner = allowed.includes(corner)
        ? corner
        : allowed[0];

      const { x, y } = computeXYForCorner(cornerToUse, bounds);

      controls.start({ x, y, transition: { duration: instant ? 0 : 0.2 } });
      setCurrentCorner(cornerToUse);
      if (typeof window !== "undefined" && storageKey) {
        try {
          window.localStorage.setItem(storageKey, cornerToUse);
        } catch {}
      }
    },
    [
      allowedCorners,
      controls,
      getSnapBounds,
      computeXYForCorner,
      parentRef,
      storageKey,
    ]
  );

  // Place the element at the initial snapped corner on mount
  useLayoutEffect(() => {
    const parent = parentRef.current;
    const el = boxRef.current;
    if (!parent || !el) return;

    const setInitial = () => {
      const p = parent.getBoundingClientRect();
      const e = el.getBoundingClientRect();

      const { minX, maxX, minY, maxY } = getSnapBounds(p, e, el);

      const savedCorner = (() => {
        if (typeof window === "undefined" || !storageKey) return null;
        const v = window.localStorage.getItem(storageKey);
        if (
          v === "top-left" ||
          v === "top-right" ||
          v === "bottom-left" ||
          v === "bottom-right"
        )
          return v as Corner;
        return null;
      })();

      const allowed: ReadonlyArray<Corner> =
        allowedCorners && allowedCorners.length > 0
          ? allowedCorners
          : ALL_CORNERS;

      const cornerToUse: Corner =
        savedCorner && allowed.includes(savedCorner)
          ? savedCorner
          : allowed.includes(initialCorner)
          ? initialCorner
          : allowed[0];

      const { x: targetX, y: targetY } = computeXYForCorner(cornerToUse, {
        minX,
        maxX,
        minY,
        maxY,
      });

      // Set instantly to avoid animation/jump on first paint
      const c = controls as unknown as {
        set?: (v: { x?: number; y?: number }) => void;
        start: typeof controls.start;
      };
      if (typeof c.set === "function") {
        c.set({ x: targetX, y: targetY });
        setCurrentCorner(cornerToUse);
      } else {
        controls
          .start({ x: targetX, y: targetY, transition: { duration: 0 } })
          .then(() => setCurrentCorner(cornerToUse));
      }
      if (typeof window !== "undefined" && storageKey) {
        try {
          window.localStorage.setItem(storageKey, cornerToUse);
        } catch {}
      }
    };

    const id = requestAnimationFrame(setInitial);
    return () => cancelAnimationFrame(id);
  }, [
    parentRef,
    inset,
    initialCorner,
    allowedCorners,
    storageKey,
    controls,
    getSnapBounds,
    computeXYForCorner,
  ]);

  // Re-snap on orientation or parent/element resize so it stays aligned
  useEffect(() => {
    if (!currentCorner) return;
    const handler = () => {
      resnapToCorner(currentCorner, true);
    };

    window.addEventListener("resize", handler);
    window.addEventListener("orientationchange", handler);

    const parent = parentRef.current;
    const el = boxRef.current;
    const ro =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(handler)
        : null;
    if (ro) {
      if (parent) ro.observe(parent);
      if (el) ro.observe(el);
    }

    return () => {
      window.removeEventListener("resize", handler);
      window.removeEventListener("orientationchange", handler);
      if (ro) ro.disconnect();
    };
  }, [parentRef, currentCorner, resnapToCorner]);

  const onDragEnd = () => {
    const parent = parentRef.current;
    const el = boxRef.current;
    if (!parent || !el) return;

    const p = parent.getBoundingClientRect();
    const e = el.getBoundingClientRect();

    const { minX, maxX, minY, maxY } = getSnapBounds(p, e, el);

    const cx = e.left - p.left + e.width / 2;
    const cy = e.top - p.top + e.height / 2;

    const cornerCenters: Record<
      Corner,
      { x: number; y: number; tlx: number; tly: number }
    > = {
      "top-left": {
        x: minX + e.width / 2,
        y: minY + e.height / 2,
        tlx: minX,
        tly: minY,
      },
      "top-right": {
        x: maxX + e.width / 2,
        y: minY + e.height / 2,
        tlx: maxX,
        tly: minY,
      },
      "bottom-left": {
        x: minX + e.width / 2,
        y: maxY + e.height / 2,
        tlx: minX,
        tly: maxY,
      },
      "bottom-right": {
        x: maxX + e.width / 2,
        y: maxY + e.height / 2,
        tlx: maxX,
        tly: maxY,
      },
    };

    const allowed: ReadonlyArray<Corner> =
      allowedCorners && allowedCorners.length > 0
        ? allowedCorners
        : ALL_CORNERS;

    let bestCorner: Corner = allowed[0];
    let bestDist = Number.POSITIVE_INFINITY;
    for (const c of allowed) {
      const center = cornerCenters[c];
      const dx = center.x - cx;
      const dy = center.y - cy;
      const dist = dx * dx + dy * dy;
      if (dist < bestDist) {
        bestDist = dist;
        bestCorner = c;
      }
    }

    const { tlx, tly } = cornerCenters[bestCorner];

    controls.start({
      x: tlx,
      y: tly,
      transition: { type: "spring", stiffness: 500, damping: 40 },
    });

    setCurrentCorner(bestCorner);
    if (typeof window !== "undefined" && storageKey) {
      try {
        window.localStorage.setItem(storageKey, bestCorner);
      } catch {}
    }
  };

  return (
    <motion.div
      ref={boxRef}
      className={`absolute top-0 left-0 ${className}`}
      animate={controls}
      drag
      dragConstraints={parentRef}
      dragElastic={0.5}
      dragMomentum
      onDragEnd={onDragEnd}
    >
      {children}
    </motion.div>
  );
}
