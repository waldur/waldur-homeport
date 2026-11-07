import { useQuery } from '@tanstack/react-query';
import { FC } from 'react';
import {
  marketplaceSlurmPeriodicUsagePoliciesCommandHistoryList,
  marketplaceSlurmPeriodicUsagePoliciesEvaluationLogsList,
  SlurmPolicyEvaluationLog,
} from 'waldur-js-client';

import {
  Badge,
  BadgeVariant,
  Code,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from 'waldur-ui';

import { formatDateTime } from '@/core/dateUtils';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { translate } from '@/i18n';
import { ModalDialog } from '@/modal/ModalDialog';
import { renderFieldOrDash } from '@/table/utils';

interface SlurmPolicyExecutionLogDialogProps {
  resolve: {
    policyUuid: string;
  };
}

const UsagePercentageBadge: FC<{ value: number; graceLimit: number }> = ({
  value,
  graceLimit,
}) => {
  let variant: BadgeVariant = 'success';
  if (value >= graceLimit) {
    variant = 'danger';
  } else if (value >= 100) {
    variant = 'warning';
  } else if (value >= 80) {
    variant = 'info';
  }
  return (
    <Badge variant={variant} size="sm" shape="pill" tone="outline">
      {value.toFixed(1)}%
    </Badge>
  );
};

const ActionBadge: FC<{ action: string }> = ({ action }) => {
  const variantMap: Record<string, BadgeVariant> = {
    pause: 'danger',
    downscale: 'warning',
    notify: 'info',
  };
  return (
    <Badge
      variant={variantMap[action] || 'secondary'}
      size="sm"
      shape="pill"
      tone="outline"
      className="me-1"
    >
      {action}
    </Badge>
  );
};

const SiteAgentStatusBadge: FC<{
  sent: boolean;
  confirmed: boolean | null;
}> = ({ sent, confirmed }) => {
  if (!sent) {
    return (
      <Badge variant="secondary" size="sm" shape="pill" tone="outline">
        {translate('N/A')}
      </Badge>
    );
  }
  if (confirmed === null) {
    return (
      <Badge variant="warning" size="sm" shape="pill" tone="outline">
        {translate('Pending')}
      </Badge>
    );
  }
  if (confirmed) {
    return (
      <Badge variant="success" size="sm" shape="pill" tone="outline">
        {translate('OK')}
      </Badge>
    );
  }
  return (
    <Badge variant="danger" size="sm" shape="pill" tone="outline">
      {translate('Failed')}
    </Badge>
  );
};

const EvaluationHistoryTab: FC<{ policyUuid: string }> = ({ policyUuid }) => {
  const { data, isLoading } = useQuery({
    queryKey: ['slurm-evaluation-logs-dialog', policyUuid],
    queryFn: async () => {
      const response =
        await marketplaceSlurmPeriodicUsagePoliciesEvaluationLogsList({
          path: { uuid: policyUuid },
        });
      return response.data;
    },
  });

  if (isLoading) return <LoadingSpinner />;
  if (!data || data.length === 0) {
    return (
      <div className="text-quaternary text-center py-3">
        {translate('No evaluation history available.')}
      </div>
    );
  }

  return (
    <Table density="compact">
      <TableHeader>
        <TableRow>
          <TableHead>{translate('Timestamp')}</TableHead>
          <TableHead>{translate('Resource')}</TableHead>
          <TableHead>{translate('Usage')}</TableHead>
          <TableHead>{translate('Actions')}</TableHead>
          <TableHead>{translate('State change')}</TableHead>
          <TableHead>{translate('Site agent')}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((log: SlurmPolicyEvaluationLog) => {
          const prevState = log.previous_state as {
            paused?: boolean;
            downscaled?: boolean;
          };
          const newState = log.new_state as {
            paused?: boolean;
            downscaled?: boolean;
          };
          const actions = (log.actions_taken || []) as string[];
          return (
            <TableRow key={log.uuid}>
              <TableCell className="whitespace-nowrap">
                {formatDateTime(log.evaluated_at)}
              </TableCell>
              <TableCell>{log.resource_name || log.resource_uuid}</TableCell>
              <TableCell>
                <UsagePercentageBadge
                  value={log.usage_percentage}
                  graceLimit={log.grace_limit_percentage}
                />
              </TableCell>
              <TableCell>
                {actions.length > 0
                  ? actions.map((a) => <ActionBadge key={a} action={a} />)
                  : '-'}
              </TableCell>
              <TableCell className="small">
                {prevState?.paused !== newState?.paused && (
                  <span>
                    paused: {String(prevState?.paused)} &rarr;{' '}
                    {String(newState?.paused)}
                  </span>
                )}
                {prevState?.downscaled !== newState?.downscaled && (
                  <span className="ms-1.5">
                    downscaled: {String(prevState?.downscaled)} &rarr;{' '}
                    {String(newState?.downscaled)}
                  </span>
                )}
                {prevState?.paused === newState?.paused &&
                  prevState?.downscaled === newState?.downscaled &&
                  '-'}
              </TableCell>
              <TableCell>
                <SiteAgentStatusBadge
                  sent={log.stomp_message_sent}
                  confirmed={log.site_agent_confirmed}
                />
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};

const CommandHistoryTab: FC<{ policyUuid: string }> = ({ policyUuid }) => {
  const { data, isLoading } = useQuery({
    queryKey: ['slurm-command-history-dialog', policyUuid],
    queryFn: async () => {
      const response =
        await marketplaceSlurmPeriodicUsagePoliciesCommandHistoryList({
          path: { uuid: policyUuid },
        });
      return response.data;
    },
  });

  if (isLoading) return <LoadingSpinner />;
  if (!data || data.length === 0) {
    return (
      <div className="text-quaternary text-center py-3">
        {translate('No command history available.')}
      </div>
    );
  }

  return (
    <Table density="compact">
      <TableHeader>
        <TableRow>
          <TableHead>{translate('Timestamp')}</TableHead>
          <TableHead>{translate('Type')}</TableHead>
          <TableHead>{translate('Command')}</TableHead>
          <TableHead>{translate('Mode')}</TableHead>
          <TableHead>{translate('Status')}</TableHead>
          <TableHead>{translate('Error')}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((cmd) => (
          <TableRow key={cmd.uuid}>
            <TableCell className="whitespace-nowrap">
              {formatDateTime(cmd.executed_at)}
            </TableCell>
            <TableCell>
              <Badge variant="secondary" size="sm" shape="pill" tone="outline">
                {cmd.command_type}
              </Badge>
            </TableCell>
            <TableCell>
              <Code className="small">{cmd.shell_command}</Code>
            </TableCell>
            <TableCell>
              <Badge
                variant={
                  cmd.execution_mode === 'production' ? 'primary' : 'info'
                }
                size="sm"
                shape="pill"
                tone="outline"
              >
                {cmd.execution_mode}
              </Badge>
            </TableCell>
            <TableCell>
              {cmd.success ? (
                <Badge variant="success" size="sm" shape="pill" tone="outline">
                  {translate('OK')}
                </Badge>
              ) : (
                <Badge variant="danger" size="sm" shape="pill" tone="outline">
                  {translate('Failed')}
                </Badge>
              )}
            </TableCell>
            <TableCell className="small text-danger">
              {renderFieldOrDash(cmd.error_message)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export const SlurmPolicyExecutionLogDialog: FC<
  SlurmPolicyExecutionLogDialogProps
> = ({ resolve: { policyUuid } }) => {
  return (
    <ModalDialog title={translate('Policy execution log')} bodyClassName="p-0">
      <div className="p-3">
        <Tabs mount="active" defaultValue="evaluations">
          <TabsList className="mb-3">
            <TabsTrigger value="evaluations">
              {translate('Evaluation history')}
            </TabsTrigger>
            <TabsTrigger value="commands">
              {translate('Command history')}
            </TabsTrigger>
          </TabsList>
          <div className="tab-content">
            <TabsContent value="evaluations">
              <EvaluationHistoryTab policyUuid={policyUuid} />
            </TabsContent>
            <TabsContent value="commands">
              <CommandHistoryTab policyUuid={policyUuid} />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </ModalDialog>
  );
};
