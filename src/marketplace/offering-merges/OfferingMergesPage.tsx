import { FC } from 'react';

import { isFeatureVisible } from '@/features/connect';
import { MarketplaceFeatures } from '@/FeaturesEnums';

import { DuplicateOfferingGroupsList } from './DuplicateOfferingGroupsList';
import { OfferingMergesList } from './OfferingMergesList';

export const OfferingMergesPage: FC = () => (
  <div className="d-flex flex-column gap-7">
    <OfferingMergesList />
    {isFeatureVisible(
      MarketplaceFeatures.show_openstack_duplicate_offerings,
    ) && <DuplicateOfferingGroupsList />}
  </div>
);
