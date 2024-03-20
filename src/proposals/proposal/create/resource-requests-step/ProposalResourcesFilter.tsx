import { FC } from 'react';
import { reduxForm } from 'redux-form';

import { translate } from '@waldur/i18n';
import { CallOffering } from '@waldur/proposals/types';
import { TableFilterItem } from '@waldur/table/TableFilterItem';

import { CallOfferingFilter } from './CallOfferingFilter';

interface OwnProps {
  offerings: CallOffering[];
}

const PureProposalResourcesFilter: FC<OwnProps> = ({ offerings }) => (
  <>
    <TableFilterItem
      title={translate('Offering')}
      name="offering"
      badgeValue={(value) => value?.offering_name}
    >
      <CallOfferingFilter options={offerings} />
    </TableFilterItem>
  </>
);

export const ProposalResourcesFilter = reduxForm<any, OwnProps>({
  form: 'ProposalResourcesFilter',
  destroyOnUnmount: false,
})(PureProposalResourcesFilter);
