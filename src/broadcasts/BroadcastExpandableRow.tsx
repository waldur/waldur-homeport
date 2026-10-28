import { FunctionComponent } from 'react';
import { BroadcastMessage } from 'waldur-js-client';

import { ENV } from '@/core/config';
import { formatDateTime } from '@/core/dateUtils';
import { translate } from '@/i18n';
import { Field } from '@/resource/summary';
import { ExpandableContainer } from '@/table/ExpandableContainer';

import { OptionsList } from './OptionsList';
import { RecipientsField } from './RecipientsField';

export const BroadcastExpandableRow: FunctionComponent<{
  row: BroadcastMessage;
}> = ({ row }) => (
  <ExpandableContainer>
    <div className="grid grid-cols-1 sm:grid-cols-12 gap-x-5">
      <div className="sm:col-span-8" style={{ whiteSpace: 'pre-line' }}>
        <p>{row.body}</p>
        <p>{ENV.plugins.WALDUR_CORE.COMMON_FOOTER_TEXT}</p>
      </div>
      <div className="sm:col-span-4">
        <OptionsList
          label={translate('Organizations')}
          list={row.query['customers']}
        />

        <OptionsList
          label={translate('Offerings')}
          list={row.query['offerings']}
        />

        <RecipientsField row={row} />

        {row.send_at && (
          <Field
            label={translate('Send at')}
            value={formatDateTime(row.send_at)}
            labelCol={5}
            valueCol={7}
          />
        )}
      </div>
    </div>
  </ExpandableContainer>
);
