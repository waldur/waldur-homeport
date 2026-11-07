import { FunctionComponent } from 'react';
import { RequestedOffering } from 'waldur-js-client';

import { PropertyItem } from 'waldur-ui';

import { translate } from '@/i18n';
import { Call } from '@/proposals/types';
import { ExpandableContainer } from '@/table/ExpandableContainer';

import { CallOfferingComponentRules } from './CallOfferingComponentRules';

interface CallOfferingExpandableRowProps {
  row: RequestedOffering;
  call: Call;
  refetch(): void;
  readOnlyReason?: string;
}

export const CallOfferingExpandableRow: FunctionComponent<
  CallOfferingExpandableRowProps
> = ({ row, call, refetch, readOnlyReason }) => (
  <ExpandableContainer>
    <ExpandableContainer asTable>
      <PropertyItem
        label={translate('Plan')}
        value={row.plan_details?.name}
        hideIfEmpty={false}
      />
    </ExpandableContainer>
    <div className="mt-3">
      <CallOfferingComponentRules
        offering={row}
        call={call}
        refetch={refetch}
        readOnlyReason={readOnlyReason}
      />
    </div>
  </ExpandableContainer>
);
