import { useEffect, useState } from 'react';

import { translate } from '@/i18n';

import { listInferenceModels } from './streamChat';

export interface InferenceModelState {
  models: string[];
  model: string;
  setModel: (model: string) => void;
  error: string | null;
}

// Loads the endpoint's model list for the picker and tracks the selection.
// Shared by the inline view (picker on the left) and the dialog so both drive
// the same chat model.
export const useInferenceModels = (
  endpoint: string | null,
  apiKey?: string | null,
): InferenceModelState => {
  const [models, setModels] = useState<string[]>([]);
  const [model, setModel] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!endpoint) {
      setModels([]);
      setModel('');
      return;
    }
    const controller = new AbortController();
    // Drop the previous endpoint's models before probing the new one, so a
    // failed load leaves the picker empty (disabled + "Models unavailable")
    // instead of offering a dead selection from the old endpoint.
    setModels([]);
    setModel('');
    setError(null);
    listInferenceModels(endpoint, apiKey, controller.signal)
      .then((ids) => {
        setModels(ids);
        setModel(ids[0]);
      })
      .catch((e) => {
        if ((e as Error)?.name !== 'AbortError') {
          setError(
            (e as Error)?.message ?? translate('Could not load models.'),
          );
        }
      });
    return () => controller.abort();
  }, [endpoint, apiKey]);

  return { models, model, setModel, error };
};
