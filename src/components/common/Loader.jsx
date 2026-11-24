
import { motion } from "framer-motion";

export default function Loader({ fullScreen = false }) {
  return (
    <div
      className={`grid place-items-center ${
        fullScreen
          ? "fixed inset-0 z-[9999] min-h-screen bg-[#171719]"
          : "min-h-40 bg-transparent"
      }`}
    >
      <div className="flex w-full max-w-[240px] flex-col items-center px-6">

        {/* LOGO */}
        <motion.div
          initial={{ opacity: 0, y: 12, scale: 0.94 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="relative mb-8"
        >
          <motion.div
            animate={{ opacity: [0.15, 0.35, 0.15], scale: [0.9, 1.12, 0.9] }}
            transition={{
              duration: 2.2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute inset-0 rounded-full bg-zlit-red/30 blur-2xl"
          />

          <img
            src="/logo.webp"
            alt="ZLIT"
            className="relative h-14 w-auto object-contain"
          />
        </motion.div>

        {/* LOADING TEXT */}
        <motion.p
          animate={{ opacity: [0.45, 1, 0.45] }}
          transition={{
            duration: 1.6,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="mb-5 text-[10px] font-semibold uppercase tracking-[0.35em] text-white/70"
        >
          Preparing your experience
        </motion.p>

        {/* PROGRESS LINE */}
        <div className="h-[3px] w-full overflow-hidden rounded-full bg-white/10">
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: "250%" }}
            transition={{
              duration: 1.4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="h-full w-1/2 rounded-full bg-zlit-red"
            style={{ willChange: "transform" }}
          />
        </div>

        {/* FOOTER */}
        <div className="mt-5 flex items-center gap-2">
          <span className="h-1 w-1 rounded-full bg-zlit-red" />
          <span className="text-[9px] font-medium tracking-[0.3em] text-white/30">
            DEFINE YOUR STYLE
          </span>
        </div>
      </div>
    </div>
  );
}
