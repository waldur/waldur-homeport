import { useQuery } from '@tanstack/react-query';
import { FC } from 'react';
import { Card } from 'react-bootstrap';
import {
  marketplaceSlurmPeriodicUsagePoliciesEvaluationLogsList,
  SlurmPolicyEvaluationLog,
} from 'waldur-js-client';

import { Badge } from 'waldur-ui';

import { FAST_STALE_TIME } from '@/core/constants';
import { formatDateTime } from '@/core/dateUtils';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { translate } from '@/i18n';

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
    staleTime: FAST_STALE_TIME,
    enabled: !!policyUuid,
  });

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!data || data.length === 0) {
    return (
      <Card className="mb-3 border-dashed border-divider-medium">
        <Card.Body className="py-2.5">
          <div className="text-quaternary text-center">
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
          <Badge variant="secondary" size="sm" shape="pill" tone="outline">
            {translate('No command sent')}
          </Badge>
        );
      }
      return (
        <Badge variant="warning" size="sm" shape="pill" tone="outline">
          {translate('Awaiting confirmation')}
        </Badge>
      );
    }
    if (lastEvaluation.site_agent_confirmed) {
      return (
        <Badge variant="success" size="sm" shape="pill" tone="outline">
          {translate('Confirmed')}
        </Badge>
      );
    }
    return (
      <Badge variant="danger" size="sm" shape="pill" tone="outline">
        {translate('Failed')}
      </Badge>
    );
  };

  return (
    <Card className="mb-3">
      <Card.Body className="py-2.5">
        <div className="flex flex-wrap gap-3 items-center">
          <div>
            <span className="text-quaternary small">
              {translate('Last evaluation')}
            </span>
            <div className="font-medium">
              {formatDateTime(lastEvaluation.evaluated_at)}
            </div>
          </div>
          <div>
            <span className="text-quaternary small">
              {translate('Paused resources')}
            </span>
            <div className="font-medium">{pausedCount}</div>
          </div>
          <div>
            <span className="text-quaternary small">
              {translate('Downscaled resources')}
            </span>
            <div className="font-medium">{downscaledCount}</div>
          </div>
          <div>
            <span className="text-quaternary small">
              {translate('Site agent status')}
            </span>
            <div>{getAgentStatusBadge()}</div>
          </div>
        </div>
      </Card.Body>
    </Card>
  );
};
