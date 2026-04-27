import { FC } from 'react';
import { reduxForm } from 'redux-form';

import { translate } from '@/i18n';
import { TableFilterItem } from '@/table/TableFilterItem';

import { CallOfferingFilter } from './CallOfferingFilter';

interface OwnProps {
  offerings: Parameters<typeof CallOfferingFilter>['0']['options'];
}

const PureProposalResourcesFilter: FC<OwnProps> = ({ offerings }) => (
  <TableFilterItem
    title={translate('Offering')}
    name="offering"
    badgeValue={(value) => value?.offering_name}
  >
    <CallOfferingFilter options={offerings} />
  </TableFilterItem>
);

export const ProposalResourcesFilter = reduxForm<{}, OwnProps>({
  form: 'ProposalResourcesFilter',
  destroyOnUnmount: false,
})(PureProposalResourcesFilter);
