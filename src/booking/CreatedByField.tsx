import { FunctionComponent } from 'react';

import { BookingResource } from '@waldur/booking/types';
import { Tooltip } from '@waldur/core/Tooltip';
import { translate } from '@waldur/i18n';

export const CreatedByField: FunctionComponent<{ row: BookingResource }> = ({
  row,
}) => (
  <>
    {row.created_by_full_name}
    {row.approved_by_full_name && (
      <>
        {' '}
        <Tooltip
          id="created-by-tooltip"
          label={translate('Request approved by {name}', {
            name: row.approved_by_full_name,
          })}
        >
          <i className="fa fa-question-circle" />
        </Tooltip>
      </>
    )}
  </>
);
