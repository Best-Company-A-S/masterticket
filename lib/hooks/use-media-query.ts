"use client";

import { useEffect, useState } from "react";

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);

    // Set the initial value
    setMatches(media.matches);

    // Define a callback function to handle changes
    const listener = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    // Add the callback as a listener for changes to the media query
    media.addEventListener("change", listener);

    // Remove the listener when the component is unmounted
    return () => {
      media.removeEventListener("change", listener);
    };
  }, [query]);

  return matches;
}
