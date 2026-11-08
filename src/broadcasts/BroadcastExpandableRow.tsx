import { FunctionComponent } from 'react';
import { BroadcastMessage } from 'waldur-js-client';

import { PropertyList, PropertyItem } from 'waldur-ui';

import { ENV } from '@/core/config';
import { translate } from '@/i18n';
import { propVal } from '@/property/propertyFields';
import { ExpandableContainer } from '@/table/ExpandableContainer';

import { OptionsList } from './OptionsList';
import { RecipientsField } from './RecipientsField';

export const BroadcastExpandableRow: FunctionComponent<{
  row: BroadcastMessage;
}> = ({ row }) => (
  <ExpandableContainer>
    <div className="grid grid-cols-1 sm:grid-cols-12 gap-x-5">
      <div className="sm:col-span-8 whitespace-pre-line">
        <p>{row.body}</p>
        <p>{ENV.plugins.WALDUR_CORE.COMMON_FOOTER_TEXT}</p>
      </div>
      <div className="sm:col-span-4">
        {/* One list for the whole column: its rows come from here and from
            OptionsList / RecipientsField, which take their layout from it. */}
        <PropertyList variant="summary" termWidth="40%">
          <OptionsList
            label={translate('Organizations')}
            list={row.query['customers']}
          />
          <OptionsList
            label={translate('Offerings')}
            list={row.query['offerings']}
          />
          <RecipientsField row={row} />
          <PropertyItem
            label={translate('Send at')}
            value={propVal.date(row.send_at, { precision: 'datetime' })}
          />
        </PropertyList>
      </div>
    </div>
  </ExpandableContainer>
);
