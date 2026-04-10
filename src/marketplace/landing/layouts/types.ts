import { NestedTag } from 'waldur-js-client';

export interface MarketplaceLayoutProps {
  onTagClick?(tag: NestedTag): void;
}
