import { motion } from 'framer-motion';

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.6 } }
};

const slideIn = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.6 } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2
    }
  }
};

export default function Hero() {
  return (
    <section className="relative h-[40vh] flex flex-col justify-center px-6 md:px-12">
      <div className="absolute inset-0 bg-radial-glow pointer-events-none opacity-60 transition-opacity duration-300" />

      <motion.div
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
        className="relative z-10 max-w-5xl"
      >
        <motion.h1
          variants={slideIn}
          className="font-mono text-4xl md:text-5xl text-text-primary mb-3 tracking-tight font-bold"
        >
          cluttered_cabinet
        </motion.h1>

        <motion.p
          variants={fadeIn}
          className="text-text-secondary text-sm mb-2 font-mono"
        >
          /darpan_ganatra
        </motion.p>

        <motion.p
          variants={fadeIn}
          className="text-text-secondary text-sm max-w-xl font-mono"
        >
          → experiments in representation, learning, and systems
        </motion.p>
      </motion.div>
    </section>
  );
}
