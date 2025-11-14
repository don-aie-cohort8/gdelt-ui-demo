/**
 * Custom hook for managing query history with localStorage
 */

import { useState, useEffect } from "react";

const STORAGE_KEY = "gdelt-query-history";
const MAX_HISTORY = 10;

export interface QueryHistoryItem {
  id: string;
  question: string;
  retriever: string;
  timestamp: number;
  answer?: string;
}

export function useQueryHistory() {
  const [history, setHistory] = useState<QueryHistoryItem[]>([]);

  // Load history from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as QueryHistoryItem[];
        setHistory(parsed);
      }
    } catch (error) {
      console.error("Failed to load query history:", error);
      setHistory([]);
    }
  }, []);

  // Save to localStorage whenever history changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    } catch (error) {
      console.error("Failed to save query history:", error);
    }
  }, [history]);

  const addToHistory = (item: Omit<QueryHistoryItem, "id" | "timestamp">) => {
    const newItem: QueryHistoryItem = {
      ...item,
      id: Date.now().toString(),
      timestamp: Date.now(),
    };

    setHistory((prev) => {
      const updated = [newItem, ...prev];
      return updated.slice(0, MAX_HISTORY);
    });
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  const removeItem = (id: string) => {
    setHistory((prev) => prev.filter((item) => item.id !== id));
  };

  return {
    history,
    addToHistory,
    clearHistory,
    removeItem,
  };
}
