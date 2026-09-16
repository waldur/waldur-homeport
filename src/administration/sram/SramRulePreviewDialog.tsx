import { FC, useCallback } from 'react';
import {
  SramProjectRule,
  sramProjectRulesPreviewList,
  SramRulePreviewItem,
  SramRulePreviewProject,
  SramRulePreviewUser,
} from 'waldur-js-client';

import { AlertItem } from '@/core/AlertItem';
import { Badge } from '@/core/Badge';
import { OrganizationLink } from '@/customer/list/OrganizationLink';
import { translate } from '@/i18n';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { ProjectLink } from '@/project/ProjectLink';
import { createFetcher } from '@/table/api';
import { ExpandableContainer } from '@/table/ExpandableContainer';
import Table from '@/table/Table';
import { Column } from '@/table/types';
import { useTable } from '@/table/useTable';
import { renderFieldOrDash } from '@/table/utils';

import { SramGroupKindBadge } from './SramGroupKindBadge';

type PreviewRow = SramRulePreviewItem & { uuid: string };

/** Serve rows already in memory page by page. */
const pageOf =
  <T,>(rows: T[]) =>
  ({ currentPage, pageSize }: { currentPage: number; pageSize: number }) => {
    const start = (currentPage - 1) * pageSize;
    return Promise.resolve({
      rows: rows.slice(start, start + pageSize),
      resultCount: rows.length,
    });
  };

const PreviewProjectsTable: FC<{ row: PreviewRow }> = ({ row }) => {
  const tableProps = useTable({
    table: `sram-rule-preview-projects-${row.uuid}`,
    fetchData: pageOf(row.projects),
  });
  const columns: Column<SramRulePreviewProject>[] = [
    {
      title: translate('Project'),
      render: ({ row: project }) => (
        <ProjectLink
          row={{
            uuid: project.uuid,
            name: project.name,
            customer_uuid: row.group.customer_uuid,
          }}
          showIndustry={false}
        />
      ),
      id: 'name',
    },
    {
      title: translate('Slug'),
      render: ({ row: project }) => renderFieldOrDash(project.slug),
      id: 'slug',
    },
    {
      title: translate('Backend ID'),
      render: ({ row: project }) => renderFieldOrDash(project.backend_id),
      id: 'backend_id',
    },
  ];
  return (
    <Table<SramRulePreviewProject>
      {...tableProps}
      columns={columns}
      title={translate('Projects')}
      verboseName={translate('projects')}
      emptyMessage={translate(
        'The pattern selects no project in this organization.',
      )}
      placeholderHasRetry={false}
      hasActionBar={false}
    />
  );
};

const PreviewUsersTable: FC<{ row: PreviewRow }> = ({ row }) => {
  const tableProps = useTable({
    table: `sram-rule-preview-users-${row.uuid}`,
    fetchData: pageOf(row.users),
  });
  const columns: Column<SramRulePreviewUser>[] = [
    {
      title: translate('Name'),
      render: ({ row: user }) => renderFieldOrDash(user.full_name),
      id: 'full_name',
    },
    {
      title: translate('Username'),
      render: ({ row: user }) => renderFieldOrDash(user.username),
      id: 'username',
    },
  ];
  return (
    <Table<SramRulePreviewUser>
      {...tableProps}
      columns={columns}
      title={translate('Users who get the role')}
      verboseName={translate('users')}
      emptyMessage={translate(
        'Nobody holds the placeholder role of this group yet.',
      )}
      placeholderHasRetry={false}
      hasActionBar={false}
    />
  );
};

const PreviewExpandableRow: FC<{ row: PreviewRow }> = ({ row }) => (
  <ExpandableContainer>
    <div className="d-flex flex-column gap-5">
      <PreviewProjectsTable row={row} />
      <PreviewUsersTable row={row} />
    </div>
  </ExpandableContainer>
);

interface SramRulePreviewDialogProps {
  resolve: { rule: SramProjectRule };
}

export const SramRulePreviewDialog: FC<SramRulePreviewDialogProps> = ({
  resolve,
}) => {
  const ruleUuid = resolve.rule.uuid;
  // Preview items have no uuid of their own; the table keys rows by the group.
  const fetchData = useCallback(
    async (request) => {
      const result = await createFetcher(sramProjectRulesPreviewList, {
        path: { uuid: ruleUuid },
      })(request);
      const rows: PreviewRow[] = result.rows.map((item) => ({
        ...item,
        uuid: item.group.uuid,
      }));
      return { ...result, rows };
    },
    [ruleUuid],
  );

  const tableProps = useTable({
    table: `sram-rule-preview-${ruleUuid}`,
    fetchData,
  });

  const columns: Column<PreviewRow>[] = [
    {
      title: translate('SRAM group'),
      render: ({ row }) => (
        <div>
          <div className="d-flex align-items-center gap-2">
            {row.group.display_name}
            <SramGroupKindBadge kind={row.group.kind} />
          </div>
          <small className="text-muted">{row.group.urn}</small>
        </div>
      ),
      id: 'group',
    },
    {
      title: translate('Organization'),
      render: ({ row }) =>
        row.group.customer_uuid ? (
          <OrganizationLink uuid={row.group.customer_uuid}>
            {row.group.customer_name}
          </OrganizationLink>
        ) : (
          renderFieldOrDash(row.group.customer_name)
        ),
      id: 'organization',
    },
    {
      title: translate('Projects'),
      render: ({ row }) => (
        <Badge variant={row.projects.length ? 'primary' : 'default'} outline>
          {row.projects.length}
        </Badge>
      ),
      id: 'projects',
    },
    {
      title: translate('Users'),
      render: ({ row }) => (
        <Badge variant={row.users.length ? 'primary' : 'default'} outline>
          {row.users.length}
        </Badge>
      ),
      id: 'users',
    },
  ];

  return (
    <ModalDialog
      title={translate('Preview of {name}', { name: resolve.rule.name })}
      subtitle={translate(
        'The SRAM groups this rule matches now, the projects it selects in each organization, and the members who get the {role} role there. Expand a group for details.',
        {
          role:
            resolve.rule.project_role_description ||
            resolve.rule.project_role_name,
        },
      )}
      footer={<CloseDialogButton label={translate('Close')} />}
    >
      {resolve.rule.is_active === false && (
        <AlertItem
          variant="warning"
          className="mb-5"
          title={translate('This rule is inactive')}
          body={translate('It grants nothing until it is activated.')}
        />
      )}
      <Table<PreviewRow>
        {...tableProps}
        columns={columns}
        verboseName={translate('SRAM groups')}
        emptyMessage={translate(
          'The rule matches no SRAM group. Check the source, labels and group short names.',
        )}
        expandableRow={PreviewExpandableRow}
        hideTitle
        hasActionBar={false}
      />
    </ModalDialog>
  );
};
