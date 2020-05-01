import * as React from 'react';

import { formatDateTime } from '@waldur/core/dateUtils';
import { Tooltip } from '@waldur/core/Tooltip';
import { translate } from '@waldur/i18n';

import { getItemName } from './utils';

export const InvoiceItemDetails = ({ item, itemId }) => (
  <>
    <div>
      <strong>{getItemName(item)}</strong>
    </div>
    <Tooltip
      id={itemId}
      label={translate(
        'Tracked using UTC timezone, displayed with your browser’s timezone.',
      )}
    >
      <i className="fa fa-question-circle m-l-xs"></i>
    </Tooltip>{' '}
    <small>
      <span>{translate('Start time')}</span>:{' '}
      {item.start ? formatDateTime(item.start) : '-'}.
      <span>{translate('End time')}</span>:{' '}
      {item.end ? formatDateTime(item.end) : '-'}.
    </small>
    {item.details.service_provider_name && (
      <div>
        <small>
          <span>{translate('Service provider')}</span>:{' '}
          {item.details.service_provider_name}
        </small>
      </div>
    )}
  </>
);
