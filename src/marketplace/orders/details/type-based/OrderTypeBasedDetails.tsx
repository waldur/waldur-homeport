import { useMemo } from 'react';

import { formatDateTime } from '@/core/dateUtils';
import { translate } from '@/i18n';
import { Field } from '@/resource/summary';

import { getOrderType } from '../../utils';

import { LimitsUpdate } from './LimitsUpdate';
import { OptionsUpdate } from './OptionsUpdate';
import { OrderTypeBasedProps } from './OrderCommonFields';
import { ResourceCreation } from './ResourceCreation';
import { ResourceRenewal } from './ResourceRenewal';
import { ResourceTerminate } from './ResourceTerminate';
import { SwitchPlan } from './SwitchPlan';

export const OrderTypeBasedDetails = ({
  order,
  offering,
  editable,
}: OrderTypeBasedProps) => {
  const orderType = useMemo(() => getOrderType(order), [order]);

  return (
    <>
      <Field
        label={translate('Created by')}
        labelWidth={200}
        value={order.created_by_full_name + ` (${order.created_by_username})`}
      />
      <Field
        label={translate('Created at')}
        labelWidth={200}
        value={formatDateTime(order.created)}
      />

      {orderType.type === 'limits_update' ? (
        <LimitsUpdate order={order} offering={offering} />
      ) : orderType.type === 'options_update' ? (
        <OptionsUpdate order={order} offering={offering} />
      ) : orderType.type === 'switch_plan' ? (
        <SwitchPlan order={order} offering={offering} />
      ) : orderType.type === 'renew' ? (
        <ResourceRenewal order={order} offering={offering} />
      ) : orderType.type === 'terminate' ? (
        <ResourceTerminate order={order} offering={offering} />
      ) : orderType.type === 'create' ? (
        <ResourceCreation
          order={order}
          offering={offering}
          editable={editable}
        />
      ) : null}
    </>
  );
};
