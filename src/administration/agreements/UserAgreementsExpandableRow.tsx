import { FunctionComponent } from 'react';
import { UserAgreement } from 'waldur-js-client';

import { SafeMarkdown } from '@/core/SafeMarkdown';
import { translate } from '@/i18n';
import { ExpandableContainer } from '@/table/ExpandableContainer';

export const UserAgreementsExpandableRow: FunctionComponent<{
  row: UserAgreement;
}> = ({ row }) => (
  <ExpandableContainer>
    <div className="card card-bordered card-solid">
      <div className="card-header">
        <h6 className="mb-0 font-medium">{translate('Content')}</h6>
      </div>
      <div className="card-body">
        <SafeMarkdown text={row.content} smallTitles />
      </div>
    </div>
  </ExpandableContainer>
);
