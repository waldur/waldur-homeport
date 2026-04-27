import { useQuery } from '@tanstack/react-query';
import { FC } from 'react';
import { Tab, Tabs } from 'react-bootstrap';
import {
  marketplaceSlurmPeriodicUsagePoliciesCommandHistoryList,
  marketplaceSlurmPeriodicUsagePoliciesEvaluationLogsList,
  SlurmPolicyEvaluationLog,
} from 'waldur-js-client';

import { Badge } from '@/core/Badge';
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
  let variant = 'success';
  if (value >= graceLimit) {
    variant = 'danger';
  } else if (value >= 100) {
    variant = 'warning';
  } else if (value >= 80) {
    variant = 'info';
  }
  return (
    <Badge variant={variant} size="sm" pill outline>
      {value.toFixed(1)}%
    </Badge>
  );
};

const ActionBadge: FC<{ action: string }> = ({ action }) => {
  const variantMap: Record<string, string> = {
    pause: 'danger',
    downscale: 'warning',
    notify: 'info',
  };
  return (
    <Badge
      variant={variantMap[action] || 'secondary'}
      size="sm"
      pill
      outline
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
      <Badge variant="secondary" size="sm" pill outline>
        {translate('N/A')}
      </Badge>
    );
  }
  if (confirmed === null) {
    return (
      <Badge variant="warning" size="sm" pill outline>
        {translate('Pending')}
      </Badge>
    );
  }
  if (confirmed) {
    return (
      <Badge variant="success" size="sm" pill outline>
        {translate('OK')}
      </Badge>
    );
  }
  return (
    <Badge variant="danger" size="sm" pill outline>
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
      <div className="text-muted text-center py-4">
        {translate('No evaluation history available.')}
      </div>
    );
  }

  return (
    <div className="table-responsive">
      <table className="table table-hover table-sm">
        <thead>
          <tr>
            <th>{translate('Timestamp')}</th>
            <th>{translate('Resource')}</th>
            <th>{translate('Usage')}</th>
            <th>{translate('Actions')}</th>
            <th>{translate('State change')}</th>
            <th>{translate('Site agent')}</th>
          </tr>
        </thead>
        <tbody>
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
              <tr key={log.uuid}>
                <td className="text-nowrap">
                  {formatDateTime(log.evaluated_at)}
                </td>
                <td>{log.resource_name || log.resource_uuid}</td>
                <td>
                  <UsagePercentageBadge
                    value={log.usage_percentage}
                    graceLimit={log.grace_limit_percentage}
                  />
                </td>
                <td>
                  {actions.length > 0
                    ? actions.map((a) => <ActionBadge key={a} action={a} />)
                    : '-'}
                </td>
                <td className="small">
                  {prevState?.paused !== newState?.paused && (
                    <span>
                      paused: {String(prevState?.paused)} &rarr;{' '}
                      {String(newState?.paused)}
                    </span>
                  )}
                  {prevState?.downscaled !== newState?.downscaled && (
                    <span className="ms-2">
                      downscaled: {String(prevState?.downscaled)} &rarr;{' '}
                      {String(newState?.downscaled)}
                    </span>
                  )}
                  {prevState?.paused === newState?.paused &&
                    prevState?.downscaled === newState?.downscaled &&
                    '-'}
                </td>
                <td>
                  <SiteAgentStatusBadge
                    sent={log.stomp_message_sent}
                    confirmed={log.site_agent_confirmed}
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
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
      <div className="text-muted text-center py-4">
        {translate('No command history available.')}
      </div>
    );
  }

  return (
    <div className="table-responsive">
      <table className="table table-hover table-sm">
        <thead>
          <tr>
            <th>{translate('Timestamp')}</th>
            <th>{translate('Type')}</th>
            <th>{translate('Command')}</th>
            <th>{translate('Mode')}</th>
            <th>{translate('Status')}</th>
            <th>{translate('Error')}</th>
          </tr>
        </thead>
        <tbody>
          {data.map((cmd) => (
            <tr key={cmd.uuid}>
              <td className="text-nowrap">{formatDateTime(cmd.executed_at)}</td>
              <td>
                <Badge variant="secondary" size="sm" pill outline>
                  {cmd.command_type}
                </Badge>
              </td>
              <td>
                <code className="small">{cmd.shell_command}</code>
              </td>
              <td>
                <Badge
                  variant={
                    cmd.execution_mode === 'production' ? 'primary' : 'info'
                  }
                  size="sm"
                  pill
                  outline
                >
                  {cmd.execution_mode}
                </Badge>
              </td>
              <td>
                {cmd.success ? (
                  <Badge variant="success" size="sm" pill outline>
                    {translate('OK')}
                  </Badge>
                ) : (
                  <Badge variant="danger" size="sm" pill outline>
                    {translate('Failed')}
                  </Badge>
                )}
              </td>
              <td className="small text-danger">
                {renderFieldOrDash(cmd.error_message)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export const SlurmPolicyExecutionLogDialog: FC<
  SlurmPolicyExecutionLogDialogProps
> = ({ resolve: { policyUuid } }) => {
  return (
    <ModalDialog
      title={translate('Policy execution log')}
      closeButton
      bodyClassName="p-0"
    >
      <div className="p-4">
        <Tabs
          defaultActiveKey="evaluations"
          unmountOnExit
          className="nav-line-tabs mb-4"
        >
          <Tab eventKey="evaluations" title={translate('Evaluation history')}>
            <EvaluationHistoryTab policyUuid={policyUuid} />
          </Tab>
          <Tab eventKey="commands" title={translate('Command history')}>
            <CommandHistoryTab policyUuid={policyUuid} />
          </Tab>
        </Tabs>
      </div>
    </ModalDialog>
  );
};
