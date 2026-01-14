import { useState, useMemo } from 'react';

import { UIBlock, BlockHistoryEntry } from '@waldur/ai-assistant/lib/types';

interface UseVersionSelectorOptions {
  currentBlocks: UIBlock[];
  blockHistory: BlockHistoryEntry[];
}

export const useVersionSelector = ({
  currentBlocks,
  blockHistory,
}: UseVersionSelectorOptions) => {
  // -1 = current version, 0+ = history index
  const [selectedVersionIndex, setSelectedVersionIndex] = useState(-1);

  const totalVersions = blockHistory.length + 1; // history + current

  const isViewingHistory = selectedVersionIndex >= 0;

  const displayedBlocks = useMemo(() => {
    if (selectedVersionIndex === -1) {
      return currentBlocks;
    }
    return blockHistory[selectedVersionIndex]?.blocks ?? [];
  }, [selectedVersionIndex, currentBlocks, blockHistory]);

  // Convert internal index to user-facing version number
  // History[0] is oldest = Version 1, Current = Version N
  const displayVersionNumber =
    selectedVersionIndex === -1 ? totalVersions : selectedVersionIndex + 1;

  const displayLabel = `Version ${displayVersionNumber}/${totalVersions}`;

  const goToPreviousVersion = () => {
    setSelectedVersionIndex((prev) => {
      if (prev === -1) {
        // From current, go to most recent history
        return blockHistory.length - 1;
      }
      if (prev > 0) {
        return prev - 1;
      }
      return prev; // Already at oldest
    });
  };

  const goToNextVersion = () => {
    setSelectedVersionIndex((prev) => {
      if (prev === -1) return prev; // Already at current
      if (prev < blockHistory.length - 1) {
        return prev + 1;
      }
      return -1; // Move to current
    });
  };

  const canGoPrevious = selectedVersionIndex !== 0; // Can go back unless at oldest history
  const canGoNext = selectedVersionIndex !== -1; // Can go forward unless at current

  return {
    selectedVersionIndex,
    totalVersions,
    isViewingHistory,
    displayedBlocks,
    displayLabel,
    displayVersionNumber,
    goToPreviousVersion,
    goToNextVersion,
    canGoPrevious,
    canGoNext,
  };
};
