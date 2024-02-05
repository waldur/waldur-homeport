import { FC } from 'react';

import { StateIndicator } from '@waldur/core/StateIndicator';
import { translate } from '@waldur/i18n';
import { ProposalCall } from '@waldur/proposals/types';
import { callOfferingStateAliases } from '@waldur/proposals/utils';
import { createFetcher, Table } from '@waldur/table';
import { renderFieldOrDash, useTable } from '@waldur/table/utils';

import { AddOfferingButton } from './AddOfferingButton';
import { CallOfferingsTablePlaceholder } from './CallOfferingsTablePlaceholder';

interface CallOfferingsSectionProps {
  call: ProposalCall;
}

export const CallOfferingsSection: FC<CallOfferingsSectionProps> = (props) => {
  const tableProps = useTable({
    table: 'CallOfferingsList',
    fetchData: createFetcher(
      `proposal-protected-calls/${props.call.uuid}/offerings`,
    ),
  });

  return (
    <Table
      {...tableProps}
      id="offerings"
      placeholderComponent={<CallOfferingsTablePlaceholder />}
      columns={[
        {
          title: translate('Offering name'),
          render: ({ row }) => <>{row.offering_name}</>,
        },
        {
          title: translate('Provider'),
          render: ({ row }) => <>{renderFieldOrDash(row.customer_name)}</>,
        },
        {
          title: translate('Min allocation'),
          render: () => <>500TB</>,
        },
        {
          title: translate('Max allocation'),
          render: () => <>500TB</>,
        },
        {
          title: translate('State'),
          render: ({ row }) => (
            <StateIndicator
              label={callOfferingStateAliases(row.state)}
              variant={row.state === 'Accepted' ? 'success' : 'secondary'}
            />
          ),
        },
      ]}
      title={translate('Offerings')}
      verboseName={translate('Offerings')}
      actions={<AddOfferingButton />}
    />
  );
};
