import { FunctionComponent } from 'react';
import { BroadcastMessage } from 'waldur-js-client';

import { Card, CardContent, CardHeader } from 'waldur-ui';

import { SafeMarkdown } from '@/core/SafeMarkdown';
import { translate } from '@/i18n';
import { ExpandableContainer } from '@/table/ExpandableContainer';

import './BroadcastTemplateExpandableRow.scss';

export const BroadcastTemplateExpandableRow: FunctionComponent<{
  row: BroadcastMessage;
}> = ({ row }) => (
  <ExpandableContainer>
    <Card bordered variant="solid" className="broadcast-template">
      <CardHeader>
        <h6 className="mb-0 font-medium">{translate('Body')}</h6>
      </CardHeader>
      <CardContent>
        <SafeMarkdown text={row.body} smallTitles />
      </CardContent>
    </Card>
  </ExpandableContainer>
);
