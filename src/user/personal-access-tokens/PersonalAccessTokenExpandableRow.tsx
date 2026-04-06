import { FunctionComponent, useMemo } from 'react';

import { PermissionOptions } from '@waldur/administration/roles/PermissionOptions';
import { translate } from '@waldur/i18n';
import { ExpandableContainer } from '@waldur/table/ExpandableContainer';
import { renderFieldOrDash } from '@waldur/table/utils';

const scopeLabelMap = new Map<string, string>();
for (const group of PermissionOptions) {
  for (const opt of group.options) {
    scopeLabelMap.set(opt.value, `${group.label}: ${opt.label}`);
  }
}

export const PersonalAccessTokenExpandableRow: FunctionComponent<{
  row;
}> = ({ row }) => {
  const scopeLabels = useMemo(
    () =>
      row.scopes?.map((scope: string) => scopeLabelMap.get(scope) || scope) ||
      [],
    [row.scopes],
  );

  return (
    <ExpandableContainer>
      <p>
        <b className="me-2">{translate('Scopes')}:</b>
        {scopeLabels.length ? scopeLabels.join(', ') : renderFieldOrDash(null)}
      </p>
      <p>
        <b className="me-2">{translate('Last used from IP')}:</b>
        {renderFieldOrDash(row.last_used_ip)}
      </p>
      <p>
        <b className="me-2">{translate('Total usage count')}:</b>
        {renderFieldOrDash(row.use_count)}
      </p>
    </ExpandableContainer>
  );
};
