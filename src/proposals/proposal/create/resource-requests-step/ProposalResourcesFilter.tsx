import { FC } from 'react';

import { translate } from '@/i18n';
import { TableFilterItem } from '@/table/TableFilterItem';

import { CallOfferingFilter } from './CallOfferingFilter';

export const FORM_ID = 'ProposalResourcesFilter';

interface OwnProps {
  offerings?: Parameters<typeof CallOfferingFilter>['0']['options'];
}

export const ProposalResourcesFilter: FC<OwnProps> = ({ offerings }) => (
  <TableFilterItem
    title={translate('Offering')}
    name="offering"
    badgeValue={(value) => value?.offering_name}
  >
    <CallOfferingFilter options={offerings} />
  </TableFilterItem>
);
