import { NestedTag } from 'waldur-js-client';

import { Offering } from '@waldur/marketplace/types';

export type CardStyleType = 'compact' | 'detailed' | 'list' | 'minimal';

export interface OfferingCardVariantProps {
  offering: Offering;
  className?: string;
  onTagClick?(tag: NestedTag): void;
}
