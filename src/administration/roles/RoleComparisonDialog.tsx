import { FC, useMemo, useState } from 'react';
import { RoleDetails } from 'waldur-js-client';

import { ENV } from '@/core/config';
import { StateIndicator } from '@/core/StateIndicator';
import { FormGroup } from '@/form';
import { Select } from '@/form/select';
import { translate } from '@/i18n';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { Role } from '@/permissions/types';
import { createClientPaginatedFetcher } from '@/table/api';
import Table from '@/table/Table';
import { Column } from '@/table/types';
import { useTable } from '@/table/useTable';

import {
  getPermissionDiff,
  getPermissionLabel,
  getRolePermissions,
  groupPermissions,
} from './permissionDiff';

interface RoleComparisonDialogResolve {
  role: RoleDetails;
}

// Floor for the results area, so picking a baseline or swapping between short
// diffs no longer resizes the dialog. A diff long enough to fill the page still
// grows past it.
const COMPARISON_TABLE_HEIGHT = 420;

interface ComparisonRow {
  uuid: string;
  code: string;
  group: string;
  added: boolean;
}

const getRoleLabel = (role: Pick<Role, 'name' | 'description'>) =>
  role.description || role.name;

const columns: Column<ComparisonRow>[] = [
  {
    title: translate('Change'),
    render: ({ row }) => (
      <StateIndicator
        label={row.added ? translate('Added') : translate('Removed')}
        variant={row.added ? 'success' : 'danger'}
        tone="outline"
        shape="pill"
      />
    ),
    id: 'change',
  },
  {
    title: translate('Permission'),
    render: ({ row }) => <>{getPermissionLabel(row.code)}</>,
    id: 'permission',
  },
  {
    // The entity groups of the permission editor, so a difference reads the
    // same way as the editor that produced it.
    title: translate('Group'),
    render: ({ row }) => <>{row.group}</>,
    id: 'group',
  },
];

export const RoleComparisonDialog: FC<{
  resolve: RoleComparisonDialogResolve;
}> = ({ resolve }) => {
  const { role } = resolve;

  // Only roles of the same scope are comparable: permissions are scope-bound,
  // so a project role and an organization role share no baseline worth showing.
  const baselines = useMemo(
    () =>
      ENV.roles
        .filter(
          (item) =>
            item.content_type === role.content_type && item.uuid !== role.uuid,
        )
        .sort((a, b) => getRoleLabel(a).localeCompare(getRoleLabel(b))),
    [role],
  );

  // A clone is compared against the role it was cloned from by default; for a
  // hand-made role there is no such baseline, so the user picks one.
  const [baseline, setBaseline] = useState<Role>(
    () => baselines.find((item) => item.uuid === role.template_uuid) ?? null,
  );

  const diff = useMemo(() => {
    const baselinePermissions = baseline
      ? getRolePermissions(baseline)
      : undefined;
    const ownPermissions = getRolePermissions(role);
    return baselinePermissions && ownPermissions
      ? getPermissionDiff(baselinePermissions, ownPermissions)
      : null;
  }, [baseline, role]);

  const rows = useMemo<ComparisonRow[]>(() => {
    if (!diff) {
      return [];
    }
    const added = new Set(diff.added);
    return groupPermissions([...diff.added, ...diff.removed]).flatMap((group) =>
      group.codes.map((code) => ({
        uuid: code,
        code,
        group: group.label,
        added: added.has(code),
      })),
    );
  }, [diff]);

  const filter = useMemo(() => ({ _key: baseline?.uuid }), [baseline]);
  const tableProps = useTable({
    table: `role-comparison-${role.uuid}`,
    fetchData: createClientPaginatedFetcher(rows),
    filter,
  });

  return (
    <ModalDialog
      title={translate('Compare permissions of {name}', {
        name: getRoleLabel(role),
      })}
      subtitle={
        diff
          ? translate(
              'Compared with {name}: {added} added, {removed} removed, {kept} held by both.',
              {
                name: getRoleLabel(baseline),
                added: diff.added.length,
                removed: diff.removed.length,
                kept: diff.kept.length,
              },
            )
          : translate('Select a role to compare this one with.')
      }
      footer={<CloseDialogButton label={translate('Close')} />}
    >
      {/* Half width: the longest option is a role's human name. */}
      <div className="row">
        <div className="col-sm-6">
          <FormGroup
            label={translate('Compare with')}
            description={translate(
              'Only roles of the same scope can be compared.',
            )}
          >
            <Select
              value={baseline}
              options={baselines}
              onChange={(value: Role) => setBaseline(value)}
              getOptionLabel={getRoleLabel}
              getOptionValue={(item: Role) => item.uuid}
              placeholder={translate('Select a role...')}
              isClearable={false}
            />
          </FormGroup>
        </div>
      </div>
      {/* Always mounted: rendering it only once a baseline was picked made the
          dialog jump on the first selection. */}
      <Table<ComparisonRow>
        {...tableProps}
        columns={columns}
        verboseName={translate('differences')}
        emptyMessage={
          baseline
            ? translate('Both roles carry exactly the same permissions.')
            : translate('Select a role above to compare this one with.')
        }
        hideTitle
        hasActionBar={false}
        fullWidth
        cardBordered
        minHeight={COMPARISON_TABLE_HEIGHT}
        placeholderHasRetry={false}
      />
    </ModalDialog>
  );
};
