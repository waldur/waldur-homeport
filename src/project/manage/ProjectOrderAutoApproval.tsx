import { PencilSimpleIcon } from '@phosphor-icons/react';
import { useQuery } from '@tanstack/react-query';
import { FC, useMemo } from 'react';
import {
  Project,
  ProjectOrderAutoApproval as Rule,
  marketplaceProjectOrderAutoApprovalsList,
} from 'waldur-js-client';

import { Badge } from '@/core/Badge';
import { ENV } from '@/core/config';
import { SHORT_STALE_TIME } from '@/core/constants';
import { formatDateTime } from '@/core/dateUtils';
import { defaultCurrency } from '@/core/formatCurrency';
import { lazyComponent } from '@/core/lazyComponent';
import { LoadingErred } from '@/core/LoadingErred';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import FormTable from '@/form/FormTable';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { PermissionEnum } from '@/permissions/enums';
import { hasPermission } from '@/permissions/hasPermission';
import { ActionButton } from '@/table/ActionButton';
import { renderFieldOrDash } from '@/table/utils';
import { useUser } from '@/workspace/hooks';

const ProjectOrderAutoApprovalEditDialog = lazyComponent(() =>
  import('./ProjectOrderAutoApprovalEditDialog').then((module) => ({
    default: module.ProjectOrderAutoApprovalEditDialog,
  })),
);

const formatLimit = (rule?: Rule | null) =>
  rule
    ? `${defaultCurrency(parseFloat(rule.monthly_cost_limit))} / ${translate('month')}`
    : null;

interface ProjectOrderAutoApprovalProps {
  project: Project;
}

export const ProjectOrderAutoApproval: FC<ProjectOrderAutoApprovalProps> = ({
  project,
}) => {
  const user = useUser();
  const { openDialog } = useModal();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['ProjectOrderAutoApproval', project?.uuid],
    queryFn: () =>
      marketplaceProjectOrderAutoApprovalsList({
        query: { project_uuid: project?.uuid },
      }).then((response) => response.data?.[0] ?? null),
    refetchOnWindowFocus: false,
    staleTime: SHORT_STALE_TIME,
  });

  const canManage = useMemo(() => {
    if (project?.is_removed) return false;
    return (
      user.is_staff ||
      hasPermission(user, {
        permission: PermissionEnum.APPROVE_ORDER,
        projectId: project?.uuid,
        customerId: project?.customer_uuid,
      })
    );
  }, [user, project]);

  const openEditor = () =>
    openDialog(ProjectOrderAutoApprovalEditDialog, {
      resolve: { project, rule: data },
    });

  if (isLoading) return <LoadingSpinner />;
  if (error) return <LoadingErred loadData={refetch} />;

  const rule = data;
  const enabled = !!rule?.enabled;

  const rows = [
    {
      key: 'status',
      label: translate('Status'),
      value: !rule ? (
        <Badge variant="default" outline>
          {translate('Not configured')}
        </Badge>
      ) : enabled ? (
        <Badge variant="success" outline>
          {translate('Enabled')}
        </Badge>
      ) : (
        <Badge variant="default" outline>
          {translate('Disabled')}
        </Badge>
      ),
    },
    {
      key: 'monthly_cost_limit',
      label: translate('Monthly cost limit ({currency})', {
        currency: ENV.plugins.WALDUR_CORE.CURRENCY_NAME,
      }),
      value: renderFieldOrDash(formatLimit(rule)),
    },
    {
      key: 'predictability',
      label: translate('Predictability'),
      value: translate(
        'Only orders for plans without usage-based components are eligible.',
      ),
    },
    {
      key: 'created_by',
      label: translate('Configured by'),
      value: renderFieldOrDash(
        rule?.created_by_full_name || rule?.created_by_username,
      ),
    },
    {
      key: 'created',
      label: translate('Configured at'),
      value: renderFieldOrDash(rule?.created && formatDateTime(rule.created)),
    },
  ];

  return (
    <FormTable.Card
      title={translate('Order auto-approval')}
      className="card-bordered"
      actions={
        canManage ? (
          <ActionButton
            title={rule ? translate('Edit') : translate('Configure')}
            iconNode={<PencilSimpleIcon weight="bold" />}
            action={openEditor}
          />
        ) : undefined
      }
    >
      <FormTable>
        {rows.map((row) => (
          <FormTable.Item key={row.key} label={row.label} value={row.value} />
        ))}
      </FormTable>
    </FormTable.Card>
  );
};
