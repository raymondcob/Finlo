import { useLoading } from "../context/LoadingContext";
import { motion } from "framer-motion";

const LoadingSpinner = () => {
  const { isLoading, loadingMessage } = useLoading();

  if (!isLoading) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm"
    >
      <div className="bg-white dark:bg-gray-800 rounded-lg p-8 flex flex-col items-center space-y-4">
        <div className="w-16 h-16 border-4 border-finance-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-700 dark:text-gray-200 text-lg font-medium">
          {loadingMessage || "Loading..."}
        </p>
      </div>
    </motion.div>
  );
};

export default LoadingSpinner;
