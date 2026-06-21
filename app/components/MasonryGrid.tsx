"use client";

import { useMemo } from "react";
import type { Reel } from "../data/reels";
import { VideoCard } from "./VideoCard";

type Props = {
  reels: Reel[];
  onPlay: (reel: Reel, index: number) => void;
  columns: number;
};

/**
 * True Pinterest-style masonry — distributes cards into N column arrays,
 * each rendered as a flex column. Cards stack naturally at their own height.
 * No CSS `columns` (which has break-inside bugs with interactive elements).
 */
export function MasonryGrid({ reels, onPlay, columns }: Props) {
  // Distribute items into columns in order (left to right fill)
  const cols = useMemo<Reel[][]>(() => {
    const result: Reel[][] = Array.from({ length: columns }, () => []);
    reels.forEach((reel, i) => {
      result[i % columns].push(reel);
    });
    return result;
  }, [reels, columns]);

  return (
    <div
      style={{
        display: "flex",
        gap: "10px",
        alignItems: "flex-start",
        width: "100%",
      }}
    >
      {cols.map((colReels, colIdx) => (
        <div
          key={colIdx}
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            gap: "10px",
            minWidth: 0,
          }}
        >
          {colReels.map((reel) => {
            // Find the true index in the original reels array for the player
            const globalIndex = reels.indexOf(reel);
            return (
              <VideoCard
                key={reel.id}
                reel={reel}
                index={globalIndex}
                onPlay={onPlay}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}
