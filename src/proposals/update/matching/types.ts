import {
  AffinityMethodEnum,
  MatchingAlgorithm,
  MatchingConfiguration,
} from 'waldur-js-client';

import { translate } from '@/i18n';
import { Call } from '@/proposals/types';

// Use Partial to allow default configs without readonly server fields
export type MatchingConfig = Partial<MatchingConfiguration>;

export interface EditMatchingSettingProps {
  call: Call;
  name: string;
  title: string;
  refetch: () => void;
}

// Labels for affinity methods
export const AFFINITY_METHOD_LABELS: Record<AffinityMethodEnum, string> = {
  keyword: translate('Keyword matching'),
  tfidf: translate('TF-IDF similarity'),
  combined: translate('Combined (keyword + TF-IDF)'),
};

// Labels for assignment algorithms
export const ALGORITHM_LABELS: Record<MatchingAlgorithm, string> = {
  minmax: translate('MinMax (balanced load)'),
  fairflow: translate('FairFlow algorithm'),
  hungarian: translate('Hungarian algorithm'),
};
