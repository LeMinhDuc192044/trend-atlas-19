import { motion, type HTMLMotionProps, type Variants } from "framer-motion";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export const pageTransition = {
  duration: 0.28,
  ease: [0.22, 1, 0.36, 1],
} as const;

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: pageTransition },
};

export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.045,
      delayChildren: 0.04,
    },
  },
};

export function MotionPage({
  children,
  className,
  ...props
}: HTMLMotionProps<"div"> & { children: ReactNode }) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="visible"
      exit="hidden"
      variants={fadeUp}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function MotionStack({
  children,
  className,
  ...props
}: HTMLMotionProps<"div"> & { children: ReactNode }) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function MotionItem({
  children,
  className,
  hover = false,
  ...props
}: HTMLMotionProps<"div"> & { children: ReactNode; hover?: boolean }) {
  return (
    <motion.div
      className={cn(className)}
      variants={fadeUp}
      whileHover={hover ? { y: -2, transition: { duration: 0.16 } } : undefined}
      {...props}
    >
      {children}
    </motion.div>
  );
}
