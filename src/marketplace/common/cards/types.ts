import { NestedTag, Offering } from 'waldur-js-client';

export type CardStyleType = 'compact' | 'detailed' | 'list' | 'minimal';

export interface OfferingCardVariantProps {
  offering: Offering;
  className?: string;
  onTagClick?(tag: NestedTag): void;
}
