import { useState, useEffect, useCallback } from "react";
import { kv } from "@/lib/kv-storage";

/**
 * React hook for reactive key-value storage
 * Provides persistent storage with automatic state synchronization
 *
 * @param key - The storage key
 * @param defaultValue - Default value if key doesn't exist
 * @returns [value, setValue] tuple similar to useState
 */
export function useKV<T>(
  key: string,
  defaultValue: T
): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [value, setValue] = useState<T>(defaultValue);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load initial value from storage
  useEffect(() => {
    let mounted = true;

    const loadValue = async () => {
      try {
        const storedValue = await kv.get<T>(key);
        if (mounted) {
          setValue(storedValue !== undefined ? storedValue : defaultValue);
          setIsInitialized(true);
        }
      } catch (error) {
        console.error(`Error loading key ${key}:`, error);
        if (mounted) {
          setValue(defaultValue);
          setIsInitialized(true);
        }
      }
    };

    loadValue();

    return () => {
      mounted = false;
    };
  }, [key, defaultValue]);

  // Custom setter that persists to storage
  const setPersistedValue = useCallback<
    React.Dispatch<React.SetStateAction<T>>
  >(
    (newValue) => {
      setValue((currentValue) => {
        // Handle function updates
        const valueToStore =
          newValue instanceof Function ? newValue(currentValue) : newValue;

        // Persist to storage asynchronously
        kv.set(key, valueToStore).catch((error) => {
          console.error(`Error persisting key ${key}:`, error);
        });

        return valueToStore;
      });
    },
    [key]
  );

  // Return default value until initialized to prevent flash of wrong data
  return [isInitialized ? value : defaultValue, setPersistedValue];
}
