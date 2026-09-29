import { FC } from 'react';

import { isFeatureVisible } from '@/features/connect';
import { MarketplaceFeatures } from '@/FeaturesEnums';
import { TableWithPortal } from '@/table/types';

import { DuplicateOfferingGroupsList } from './DuplicateOfferingGroupsList';
import { OfferingMergesList } from './OfferingMergesList';

// Shown as a tab of the Offerings page: the merges list takes the page's
// toolbar, while the duplicate-offerings list below keeps its own card, since
// one toolbar cannot serve two tables.
export const OfferingMergesPage: FC<Partial<TableWithPortal>> = ({
  portal,
}) => (
  <div className="d-flex flex-column gap-7">
    <OfferingMergesList portal={portal} />
    {isFeatureVisible(
      MarketplaceFeatures.show_openstack_duplicate_offerings,
    ) && <DuplicateOfferingGroupsList />}
  </div>
);
