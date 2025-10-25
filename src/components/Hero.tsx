import { motion } from 'framer-motion';

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.4 } }
};

export default function Hero() {
  return (
    <section className="relative py-16 px-6 md:px-12 border-b border-border">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        className="max-w-5xl"
      >
        <h1 className="font-mono text-3xl md:text-4xl text-text-primary mb-2 tracking-tight">
          cluttered_cabinet
        </h1>

        <p className="text-text-secondary text-sm font-mono mb-1">
          darpan ganatra
        </p>

        <p className="text-text-secondary text-sm max-w-2xl font-mono">
          experiments in representation, learning, and systems
        </p>
      </motion.div>
    </section>
  );
}
