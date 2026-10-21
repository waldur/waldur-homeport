import classNames from 'classnames';
import React, { useMemo } from 'react';
import {
  PlanUsageResponse,
  ProviderOfferingDetails as Offering,
} from 'waldur-js-client';

import { translate } from '@/i18n';
import { Category } from '@/marketplace/types';
import { LayoutSlot } from '@/navigation/slots';
import { ActionsUnavailable } from '@/table/ActionsDropdown';

import { OFFERING_CUSTOMERS_LIST_FILTER } from '../expandable/constants';

import { ConnectionStatusIndicator } from './ConnectionStatusIndicator';

interface OfferingDetailsProps {
  offering: Offering;
  category: Category;
  plansUsage: PlanUsageResponse[];
  refetch(): void;
  tabSpec;
}

export const OfferingDetails: React.FC<OfferingDetailsProps> = (props) => {
  const uniqueFormId = useMemo(
    () => `${OFFERING_CUSTOMERS_LIST_FILTER}-${props.offering.uuid}`,
    [props.offering],
  );

  // `integration_status` is null — not [] — for callers the backend does not
  // consider offering administrators; see `get_integration_status` in the
  // marketplace serializer and the `| null` in the SDK type. A throw here
  // takes down every tab of the page, since this runs in the shared shell.
  const connectionStatus = props.offering.integration_status?.length > 0 && (
    <LayoutSlot name="actions">
      <ConnectionStatusIndicator status={props.offering.integration_status} />
    </LayoutSlot>
  );

  return props.tabSpec ? (
    <>
      {connectionStatus}
      <div
        className={classNames(
          'provider-offering',
          props.offering.state === 'Unavailable' && 'disabled-view',
        )}
      >
        <ActionsUnavailable
          reason={
            props.offering.state === 'Unavailable'
              ? translate('This offering is unavailable.')
              : undefined
          }
        >
          <props.tabSpec.component
            offering={props.offering}
            plansUsage={props.plansUsage}
            uniqueFormId={uniqueFormId}
          />
        </ActionsUnavailable>
      </div>
    </>
  ) : (
    connectionStatus || null
  );
};
