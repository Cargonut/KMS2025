import { useEffect, useState } from "react";
import { findPlzMatches, PlzEntry } from "../app/plz";

export default function usePlzSuggestions(value: string, limit = 8) {
  const [suggestions, setSuggestions] = useState<PlzEntry[]>([]);

  useEffect(() => {
    let active = true;
    findPlzMatches(value, limit)
      .then((matches) => {
        if (active) {
          setSuggestions(matches);
        }
      })
      .catch(() => {
        if (active) {
          setSuggestions([]);
        }
      });

    return () => {
      active = false;
    };
  }, [value, limit]);

  return suggestions;
}
