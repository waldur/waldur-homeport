import { FC, useMemo } from 'react';
import { OrganizationalAccess, OrganizationalUser } from 'waldur-js-client';

import { AccordionCard } from '@/core/AccordionCard';
import { Badge } from '@/core/Badge';
import { Link } from '@/core/Link';
import { translate } from '@/i18n';
import Table from '@/table/Table';
import { useTable } from '@/table/useTable';

interface OrganizationalAccessSectionProps {
  scopes: OrganizationalAccess[];
  isViewerStaffOrSupport?: boolean;
}

interface FlattenedScopeUser extends OrganizationalUser {
  scope_type: string;
  scope_uuid: string;
  scope_name: string;
}

export const OrganizationalAccessSection: FC<
  OrganizationalAccessSectionProps
> = ({ scopes, isViewerStaffOrSupport = false }) => {
  const { organizations, projects } = useMemo(() => {
    const orgs = scopes.filter((s) => s.scope_type === 'customer');
    const projs = scopes.filter((s) => s.scope_type === 'project');
    return { organizations: orgs, projects: projs };
  }, [scopes]);

  // Flatten all users with their scope info
  const flattenedUsers = useMemo(() => {
    const users: FlattenedScopeUser[] = [];
    scopes.forEach((scope) => {
      scope.users.forEach((user) => {
        users.push({
          ...user,
          scope_type: scope.scope_type,
          scope_uuid: scope.scope_uuid,
          scope_name: scope.scope_name,
        });
      });
    });
    return users;
  }, [scopes]);

  const tableProps = useTable({
    table: 'OrganizationalAccessUsers',
    fetchData: () => Promise.resolve({ rows: flattenedUsers }),
  });

  if (scopes.length === 0) {
    return (
      <AccordionCard
        title={translate('Organizational access')}
        defaultOpen={false}
        className="mb-4"
      >
        <p className="text-muted mb-0">
          {isViewerStaffOrSupport
            ? translate(
                'No organizational access. This user is not a member of any organization or project.',
              )
            : translate(
                'No organizational access. You are not a member of any organization or project.',
              )}
        </p>
      </AccordionCard>
    );
  }

  // Build summary text
  const summaryParts: string[] = [];
  if (organizations.length > 0) {
    summaryParts.push(
      organizations.length === 1
        ? translate('{count} organization', { count: organizations.length })
        : translate('{count} organizations', { count: organizations.length }),
    );
  }
  if (projects.length > 0) {
    summaryParts.push(
      projects.length === 1
        ? translate('{count} project', { count: projects.length })
        : translate('{count} projects', { count: projects.length }),
    );
  }
  const summaryText = summaryParts.join(` ${translate('and')} `);

  return (
    <AccordionCard
      title={translate('Organizational access')}
      subtitle={translate('Member of {summary}', { summary: summaryText })}
      defaultOpen={false}
      className="mb-4"
    >
      <p className="text-muted mb-4">
        {isViewerStaffOrSupport
          ? translate(
              "Other members of these organizations and projects can see this user's basic profile information.",
            )
          : translate(
              'Other members of these organizations and projects can see your basic profile information.',
            )}
      </p>

      <Table<FlattenedScopeUser>
        {...tableProps}
        columns={[
          {
            title: translate('User'),
            render: ({ row }) =>
              isViewerStaffOrSupport ? (
                <Link
                  state="admin-user-users.details"
                  params={{ user_uuid: row.user_uuid }}
                >
                  {row.full_name || row.username}
                </Link>
              ) : (
                <span>{row.full_name || row.username}</span>
              ),
          },
          {
            title: translate('Role'),
            render: ({ row }) =>
              row.role ? (
                <Badge variant="info" pill outline>
                  {row.role}
                </Badge>
              ) : (
                <span className="text-muted">-</span>
              ),
          },
          {
            title: translate('Type'),
            render: ({ row }) => (
              <span>
                {row.scope_type === 'customer'
                  ? translate('Organization')
                  : translate('Project')}
              </span>
            ),
          },
          {
            title: translate('Scope'),
            render: ({ row }) => (
              <Link
                state={
                  row.scope_type === 'customer'
                    ? 'organization.dashboard'
                    : 'project.dashboard'
                }
                params={{ uuid: row.scope_uuid }}
              >
                {row.scope_name}
              </Link>
            ),
          },
        ]}
        verboseName={translate('users')}
        hasActionBar={false}
        hasQuery={false}
        enableExport={false}
      />
    </AccordionCard>
  );
};
