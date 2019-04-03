import * as classNames from 'classnames';
import * as React from 'react';

import { translate } from '@waldur/i18n';
import { wrapTooltip } from '@waldur/table-react/ActionButton';

import { ResourceCreateUsageButton } from './ResourceCreateUsageButton';
import { ResourceShowUsageButton } from './ResourceShowUsageButton';

export const ResourceUsageButton = ({ row }) => {
  const disabled = !row.is_usage_based || !row.plan || !['OK', 'Updating'].includes(row.state);
  const body = (
    <div className={classNames('btn-group', {disabled})}>
      <ResourceShowUsageButton resource={row.uuid}/>
      <ResourceCreateUsageButton
        offering_uuid={row.offering_uuid}
        resource_uuid={row.uuid}
      />
    </div>
  );
  if (disabled) {
    return wrapTooltip(translate('Usage information is not available.'), body);
  } else {
    return body;
  }
};
