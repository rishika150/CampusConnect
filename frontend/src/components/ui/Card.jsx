import { motion } from "framer-motion";

export default function Card({
  children,
  className = "",
  hover = true,
}) {
  return (
    <motion.div
      whileHover={hover ? { y: -3 } : undefined}
      transition={{ duration: 0.18 }}
      className={`
        rounded-[18px]
        border
        border-[var(--border)]
        bg-[var(--surface)]
        shadow-[var(--shadow)]
        ${className}
      `}
    >
      {children}
    </motion.div>
  );
}