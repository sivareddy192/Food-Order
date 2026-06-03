import { motion } from "framer-motion";

const text = "LOADING...";

const container = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const letter = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      repeat: Infinity,
      repeatType: "reverse",
      duration: 0.6,
    },
  },
};

const LoadingSpinner = ({ fullPage = false }) => {
  const spinner = (
    <div className="flex flex-col items-center justify-center gap-6 font-luxury-sans">
      
      {/* Spinner */}
      <div className="relative flex items-center justify-center">
        {/* Outer Gold Ring */}
        <motion.div
          className="w-16 h-16 border-2 border-luxury-gold/15 border-t-luxury-gold rounded-full"
          animate={{ rotate: 360 }}
          transition={{
            repeat: Infinity,
            duration: 1.2,
            ease: "linear",
          }}
        />
        {/* Inner Green Pulse */}
        <div className="absolute w-8 h-8 bg-luxury-green/5 rounded-full animate-pulse flex items-center justify-center">
          <div className="w-2.5 h-2.5 bg-luxury-green rounded-full shadow-sm"></div>
        </div>
      </div>

      {/* Letter Animation */}
      <motion.div
        className="flex space-x-1.5 text-luxury-green-dark dark:text-neutral-300 font-bold text-[10.5px] uppercase tracking-[0.25em]"
        variants={container}
        initial="hidden"
        animate="visible"
      >
        {text.split("").map((char, index) => (
          <motion.span key={index} variants={letter}>
            {char}
          </motion.span>
        ))}
      </motion.div>
    </div>
  );

  if (fullPage) {
    return (
      <div className="fixed inset-0 bg-[#fafaf8] dark:bg-neutral-950 z-9999 flex items-center justify-center transition-colors duration-300">
        {spinner}
      </div>
    );
  }

  return (
    <div className="w-full py-20 flex items-center justify-center">
      {spinner}
    </div>
  );
};

export default LoadingSpinner;