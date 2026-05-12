import { FunctionComponent, useMemo } from 'react';

import { PermissionOptions } from '@/administration/roles/PermissionOptions';
import { translate } from '@/i18n';
import { ExpandableContainer } from '@/table/ExpandableContainer';
import { renderFieldOrDash } from '@/table/utils';

import { labelForType } from './entityFetchers';

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

  const bindings: { type: string; uuid: string | null; name: string | null }[] =
    row.allowed_scopes ?? [];

  return (
    <ExpandableContainer>
      <p>
        <b className="me-2">{translate('Permissions')}:</b>
        {scopeLabels.length ? scopeLabels.join(', ') : renderFieldOrDash(null)}
      </p>
      <p>
        <b className="me-2">{translate('Bound to')}:</b>
        {bindings.length === 0
          ? translate('Unrestricted')
          : bindings
              .map(
                (b) =>
                  `${labelForType(b.type)}: ${b.name ?? translate('(deleted)')}`,
              )
              .join(', ')}
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
