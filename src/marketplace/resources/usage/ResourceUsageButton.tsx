import * as classNames from 'classnames';
import * as React from 'react';

import { translate } from '@waldur/i18n';
import { wrapTooltip } from '@waldur/table-react/ActionButton';

import { ResourceCreateUsageButton } from './ResourceCreateUsageButton';
import { ResourceShowUsageButton } from './ResourceShowUsageButton';

export const ResourceUsageButton = ({ row }) => {
  const body = (
    <div className={classNames('btn-group', {disabled: !row.is_usage_based})}>
      <ResourceShowUsageButton resource={row.uuid}/>
      <ResourceCreateUsageButton
        offering_uuid={row.offering_uuid}
        resource_uuid={row.uuid}
        plan_unit={row.plan_unit}
      />
    </div>
  );
  if (!row.is_usage_based) {
    return wrapTooltip(translate('Resource does not have usage-based components.'), body);
  } else {
    return body;
  }
};
