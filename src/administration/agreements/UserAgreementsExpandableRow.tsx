import { FunctionComponent } from 'react';
import { UserAgreement } from 'waldur-js-client';

import { Card, CardContent, CardHeader } from 'waldur-ui';

import { SafeMarkdown } from '@/core/SafeMarkdown';
import { translate } from '@/i18n';
import { ExpandableContainer } from '@/table/ExpandableContainer';

export const UserAgreementsExpandableRow: FunctionComponent<{
  row: UserAgreement;
}> = ({ row }) => (
  <ExpandableContainer>
    <Card bordered variant="solid">
      <CardHeader>
        <h6 className="mb-0 font-medium">{translate('Content')}</h6>
      </CardHeader>
      <CardContent>
        <SafeMarkdown text={row.content} smallTitles />
      </CardContent>
    </Card>
  </ExpandableContainer>
);
