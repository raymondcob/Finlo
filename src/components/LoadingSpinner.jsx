import { motion } from 'framer-motion';

const spinnerVariants = {
  animate: {
    rotate: 360,
    transition: {
      repeat: Infinity,
      duration: 1,
      ease: 'linear',
    },
  },
};

const LoadingSpinner = () => {
  return (
    <div className="flex justify-center items-center h-screen">
      <motion.div
        className="loader ease-linear rounded-full border-8 border-t-8 border-gray-200 h-32 w-32"
        variants={spinnerVariants}
        animate="animate"
      ></motion.div>
    </div>
  );
};

export default LoadingSpinner;