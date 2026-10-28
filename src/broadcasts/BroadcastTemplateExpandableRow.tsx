import { FunctionComponent } from 'react';
import { BroadcastMessage } from 'waldur-js-client';

import { SafeMarkdown } from '@/core/SafeMarkdown';
import { translate } from '@/i18n';
import { ExpandableContainer } from '@/table/ExpandableContainer';

import './BroadcastTemplateExpandableRow.scss';

export const BroadcastTemplateExpandableRow: FunctionComponent<{
  row: BroadcastMessage;
}> = ({ row }) => (
  <ExpandableContainer>
    <div className="card broadcast-template card-bordered card-solid">
      <div className="card-header">
        <h6 className="mb-0 font-medium">{translate('Body')}</h6>
      </div>
      <div className="card-body">
        <SafeMarkdown text={row.body} smallTitles />
      </div>
    </div>
  </ExpandableContainer>
);
