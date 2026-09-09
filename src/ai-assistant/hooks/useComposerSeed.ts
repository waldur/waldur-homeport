import { useComposerRuntime } from '@assistant-ui/react';
import { useEffect } from 'react';

import { consumePendingAssistantSeed } from '@/ai-assistant/logic/assistantSeed';

/**
 * Prefills the composer from `assistantSeed`. Consumed once, so reopening the
 * drawer later does not resurrect an old offering's question.
 */
export const useComposerSeed = (): void => {
  const composerRuntime = useComposerRuntime();

  useEffect(() => {
    const seed = consumePendingAssistantSeed();
    if (seed) {
      composerRuntime.setText(seed);
    }
  }, [composerRuntime]);
};
