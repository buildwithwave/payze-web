"use client";

import { motion } from "motion/react";

export function SuccessCheck({ size = 72 }: { size?: number }) {
  return (
    <div
      className="relative mx-auto flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <motion.span
        className="absolute inset-0 rounded-full bg-emerald-100"
        initial={{ scale: 0.6, opacity: 0.8 }}
        animate={{ scale: 1.4, opacity: 0 }}
        transition={{ duration: 1.1, ease: "easeOut", delay: 0.15 }}
      />
      <motion.div
        className="relative flex items-center justify-center rounded-full bg-emerald-500"
        style={{ width: size, height: size }}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 18 }}
      >
        <svg width={size * 0.45} height={size * 0.45} viewBox="0 0 24 24" fill="none">
          <motion.path
            d="M5 13l4 4L19 7"
            stroke="white"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ delay: 0.25, duration: 0.45, ease: "easeOut" }}
          />
        </svg>
      </motion.div>
    </div>
  );
}
