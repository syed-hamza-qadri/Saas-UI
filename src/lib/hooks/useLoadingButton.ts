import { useState } from "react";

export const useLoadingButton = () => {
  const [loading, setLoading] = useState(false);

  const withLoading = async (fn: () => Promise<void>) => {
    if (loading) return;
    setLoading(true);
    try {
      await fn();
    } finally {
      setLoading(false);
    }
  };

  return { loading, withLoading };
};
