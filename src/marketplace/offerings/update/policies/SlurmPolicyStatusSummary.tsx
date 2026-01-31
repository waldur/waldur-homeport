import { useQuery } from '@tanstack/react-query';
import { FC } from 'react';
import { Card } from 'react-bootstrap';
import {
  marketplaceSlurmPeriodicUsagePoliciesEvaluationLogsList,
  SlurmPolicyEvaluationLog,
} from 'waldur-js-client';

import { Badge } from '@waldur/core/Badge';
import { formatDateTime } from '@waldur/core/dateUtils';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';

interface SlurmPolicyStatusSummaryProps {
  policyUuid: string;
}

export const SlurmPolicyStatusSummary: FC<SlurmPolicyStatusSummaryProps> = ({
  policyUuid,
}) => {
  const { data, isLoading } = useQuery({
    queryKey: ['slurm-policy-evaluation-logs', policyUuid],
    queryFn: async () => {
      const response =
        await marketplaceSlurmPeriodicUsagePoliciesEvaluationLogsList({
          path: { uuid: policyUuid },
        });
      return response.data;
    },
    staleTime: 30000,
    enabled: !!policyUuid,
  });

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!data || data.length === 0) {
    return (
      <Card className="mb-4 border-dashed">
        <Card.Body className="py-3">
          <div className="text-muted text-center">
            {translate('No evaluations recorded yet.')}
          </div>
        </Card.Body>
      </Card>
    );
  }

  const lastEvaluation = data[0] as SlurmPolicyEvaluationLog;
  const pausedCount = data.filter(
    (log) => (log.new_state as { paused?: boolean })?.paused,
  ).length;
  const downscaledCount = data.filter(
    (log) => (log.new_state as { downscaled?: boolean })?.downscaled,
  ).length;

  const getAgentStatusBadge = () => {
    if (lastEvaluation.site_agent_confirmed === null) {
      if (!lastEvaluation.stomp_message_sent) {
        return (
          <Badge variant="secondary" size="sm" pill outline>
            {translate('No command sent')}
          </Badge>
        );
      }
      return (
        <Badge variant="warning" size="sm" pill outline>
          {translate('Awaiting confirmation')}
        </Badge>
      );
    }
    if (lastEvaluation.site_agent_confirmed) {
      return (
        <Badge variant="success" size="sm" pill outline>
          {translate('Confirmed')}
        </Badge>
      );
    }
    return (
      <Badge variant="danger" size="sm" pill outline>
        {translate('Failed')}
      </Badge>
    );
  };

  return (
    <Card className="mb-4">
      <Card.Body className="py-3">
        <div className="d-flex flex-wrap gap-4 align-items-center">
          <div>
            <span className="text-muted small">
              {translate('Last evaluation')}
            </span>
            <div className="fw-bold">
              {formatDateTime(lastEvaluation.evaluated_at)}
            </div>
          </div>
          <div>
            <span className="text-muted small">
              {translate('Paused resources')}
            </span>
            <div className="fw-bold">{pausedCount}</div>
          </div>
          <div>
            <span className="text-muted small">
              {translate('Downscaled resources')}
            </span>
            <div className="fw-bold">{downscaledCount}</div>
          </div>
          <div>
            <span className="text-muted small">
              {translate('Site agent status')}
            </span>
            <div>{getAgentStatusBadge()}</div>
          </div>
        </div>
      </Card.Body>
    </Card>
  );
};
