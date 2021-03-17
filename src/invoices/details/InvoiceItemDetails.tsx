import { FunctionComponent } from 'react';

import { formatDateTime } from '@waldur/core/dateUtils';
import { Link } from '@waldur/core/Link';
import { Tooltip } from '@waldur/core/Tooltip';
import { translate } from '@waldur/i18n';

import { InvoiceEventsToggle } from '../events/InvoiceEventsToggle';
import { InvoiceItem } from '../types';

import { getItemName } from './utils';

interface InvoiceItemDetailsProps {
  item: InvoiceItem;
  itemId: string;
  customerId: string;
}

export const InvoiceItemDetails: FunctionComponent<InvoiceItemDetailsProps> = ({
  item,
  itemId,
  customerId,
}) => (
  <>
    <div>
      <strong>{getItemName(item)}</strong>{' '}
      {item.resource_uuid ? (
        <Link
          state="marketplace-public-resource-details"
          params={{ uuid: customerId, resource_uuid: item.resource_uuid }}
        >
          <i className="fa fa-external-link"></i>
        </Link>
      ) : null}
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
      {translate('Start time')}: {item.start ? formatDateTime(item.start) : '-'}
      . {translate('End time')}: {item.end ? formatDateTime(item.end) : '-'}.
    </small>
    {item.article_code && (
      <div>
        <small>
          {translate('Article code')}: {item.article_code}
        </small>
      </div>
    )}
    {item.details.service_provider_name && (
      <div>
        <small>
          {translate('Service provider')}: {item.details.service_provider_name}
        </small>
      </div>
    )}
    <InvoiceEventsToggle item={item} />
  </>
);
