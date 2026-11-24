import { motion } from "framer-motion";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";

export default function StatCard({
  title,
  value,
  change,
  icon: Icon,
  trend = "up",
  description = "Compared to last month",
}) {
  const isPositive = trend === "up";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-card border border-white/[0.06] bg-zlit-surface p-5"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-zlit-muted">{title}</p>
          <h3 className="mt-2 font-display text-2xl font-bold text-zlit-white">
            {value}
          </h3>
        </div>

        {Icon && (
          <div className="rounded-full bg-zlit-red/10 p-3 text-zlit-red">
            <Icon size={19} strokeWidth={1.8} />
          </div>
        )}
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-2">
        <span
          className={`inline-flex items-center gap-1 text-xs font-semibold ${
            isPositive ? "text-green-400" : "text-red-400"
          }`}
        >
          {isPositive ? (
            <ArrowUpRight size={14} />
          ) : (
            <ArrowDownRight size={14} />
          )}
          {change}
        </span>

        <span className="text-[10px] text-zlit-muted">{description}</span>
      </div>
    </motion.div>
  );
}