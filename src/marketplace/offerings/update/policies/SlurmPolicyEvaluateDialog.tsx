import { useMutation, useQueryClient } from '@tanstack/react-query';
import { FC, useCallback, useState } from 'react';
import { Table } from 'react-bootstrap';
import {
  marketplaceSlurmPeriodicUsagePoliciesDryRun,
  marketplaceSlurmPeriodicUsagePoliciesEvaluate,
  SlurmPolicyDryRunResponse,
  SlurmPolicyEvaluateResponse,
} from 'waldur-js-client';

import { Badge } from '@/core/Badge';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { SubmitButton } from '@/form';
import { translate } from '@/i18n';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';

interface SlurmPolicyEvaluateDialogProps {
  resolve: {
    policyUuid: string;
  };
}

export const SlurmPolicyEvaluateDialog: FC<SlurmPolicyEvaluateDialogProps> = ({
  resolve: { policyUuid },
}) => {
  const queryClient = useQueryClient();
  const [dryRunResult, setDryRunResult] =
    useState<SlurmPolicyDryRunResponse | null>(null);
  const [evaluateResult, setEvaluateResult] =
    useState<SlurmPolicyEvaluateResponse | null>(null);

  const dryRunMutation = useMutation({
    mutationFn: () =>
      marketplaceSlurmPeriodicUsagePoliciesDryRun({
        path: { uuid: policyUuid },
        body: {},
      }),
    onSuccess: (response) => {
      setDryRunResult(response.data as SlurmPolicyDryRunResponse);
      setEvaluateResult(null);
    },
  });

  const evaluateMutation = useMutation({
    mutationFn: () =>
      marketplaceSlurmPeriodicUsagePoliciesEvaluate({
        path: { uuid: policyUuid },
        body: {},
      }),
    onSuccess: (response) => {
      setEvaluateResult(response.data as SlurmPolicyEvaluateResponse);
      setDryRunResult(null);
      // Invalidate related queries so status summary and logs refresh
      queryClient.invalidateQueries({
        queryKey: ['slurm-policy-evaluation-logs', policyUuid],
      });
    },
  });

  const handleDryRun = useCallback(
    () => dryRunMutation.mutate(),
    [dryRunMutation],
  );
  const handleEvaluate = useCallback(
    () => evaluateMutation.mutate(),
    [evaluateMutation],
  );

  const isLoading = dryRunMutation.isPending || evaluateMutation.isPending;

  return (
    <ModalDialog
      title={translate('Policy evaluation (staff)')}
      footer={
        <div className="d-flex gap-2">
          <CloseDialogButton />
          <SubmitButton
            variant="outline-primary"
            onClick={handleDryRun}
            disabled={isLoading}
            submitting={dryRunMutation.isPending}
            type="button"
          >
            {translate('Dry run')}
          </SubmitButton>
          <SubmitButton
            variant="primary"
            onClick={handleEvaluate}
            disabled={isLoading}
            submitting={evaluateMutation.isPending}
            type="button"
          >
            {translate('Evaluate now')}
          </SubmitButton>
        </div>
      }
    >
      <p className="text-muted mb-4">
        {translate(
          'Dry run shows what actions would be triggered without applying changes. Evaluate runs the full evaluation synchronously — it applies actions and creates evaluation logs.',
        )}
      </p>

      {isLoading && <LoadingSpinner />}

      {dryRunMutation.isError && (
        <div className="alert alert-danger">
          {translate('Dry run failed.')}{' '}
          {String((dryRunMutation.error as Error)?.message || '')}
        </div>
      )}

      {evaluateMutation.isError && (
        <div className="alert alert-danger">
          {translate('Evaluation failed.')}{' '}
          {String((evaluateMutation.error as Error)?.message || '')}
        </div>
      )}

      {dryRunResult && <DryRunResults data={dryRunResult} />}

      {evaluateResult && <EvaluateResults data={evaluateResult} />}
    </ModalDialog>
  );
};

const DryRunResults: FC<{ data: SlurmPolicyDryRunResponse }> = ({ data }) => (
  <div>
    <h6>
      {translate('Dry run results')}
      <span className="text-muted ms-2 fw-normal">
        {translate('Period')}: {data.billing_period} |{' '}
        {translate('Grace limit')}: {data.grace_limit_percentage.toFixed(0)}%
      </span>
    </h6>
    {data.resources.length === 0 ? (
      <p className="text-muted">{translate('No active resources found.')}</p>
    ) : (
      <Table striped bordered size="sm" responsive>
        <thead>
          <tr>
            <th>{translate('Resource')}</th>
            <th>{translate('Usage')}</th>
            <th>{translate('Current state')}</th>
            <th>{translate('Would trigger')}</th>
          </tr>
        </thead>
        <tbody>
          {data.resources.map((r) => (
            <tr key={r.resource_uuid}>
              <td>
                <span className="fw-semibold">{r.resource_name}</span>
                <br />
                <code className="small">{r.resource_uuid}</code>
              </td>
              <td>
                <UsageBadge percentage={r.usage_percentage} />
              </td>
              <td>
                {r.paused && (
                  <Badge variant="danger" size="sm" outline className="me-1">
                    {translate('Paused')}
                  </Badge>
                )}
                {r.downscaled && (
                  <Badge variant="warning" size="sm" outline className="me-1">
                    {translate('Downscaled')}
                  </Badge>
                )}
                {!r.paused && !r.downscaled && (
                  <Badge variant="success" size="sm" outline>
                    {translate('Normal')}
                  </Badge>
                )}
              </td>
              <td>
                {r.would_trigger.length === 0 ? (
                  <span className="text-muted">{translate('None')}</span>
                ) : (
                  r.would_trigger.map((action) => (
                    <Badge
                      key={action}
                      variant={actionVariant(action)}
                      size="sm"
                      className="me-1"
                    >
                      {action}
                    </Badge>
                  ))
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    )}
  </div>
);

const EvaluateResults: FC<{ data: SlurmPolicyEvaluateResponse }> = ({
  data,
}) => (
  <div>
    <h6>
      {translate('Evaluation results')}
      <span className="text-muted ms-2 fw-normal">
        {translate('Period')}: {data.billing_period}
      </span>
    </h6>
    {data.resources.length === 0 ? (
      <p className="text-muted">{translate('No active resources found.')}</p>
    ) : (
      <Table striped bordered size="sm" responsive>
        <thead>
          <tr>
            <th>{translate('Resource')}</th>
            <th>{translate('Usage')}</th>
            <th>{translate('Actions taken')}</th>
            <th>{translate('State change')}</th>
          </tr>
        </thead>
        <tbody>
          {data.resources.map((r) => (
            <tr key={r.resource_uuid}>
              <td>
                <span className="fw-semibold">{r.resource_name}</span>
                <br />
                <code className="small">{r.resource_uuid}</code>
              </td>
              <td>
                <UsageBadge percentage={r.usage_percentage} />
              </td>
              <td>
                {(r.actions_taken as string[]).length === 0 ? (
                  <span className="text-muted">{translate('None')}</span>
                ) : (
                  (r.actions_taken as string[]).map((action) => (
                    <Badge
                      key={action}
                      variant={actionVariant(action)}
                      size="sm"
                      className="me-1"
                    >
                      {action}
                    </Badge>
                  ))
                )}
              </td>
              <td>
                <StateTransition
                  previous={r.previous_state as Record<string, boolean>}
                  next={r.new_state as Record<string, boolean>}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    )}
  </div>
);

const UsageBadge: FC<{ percentage: number }> = ({ percentage }) => {
  let variant: 'success' | 'warning' | 'danger' = 'success';
  if (percentage >= 120) variant = 'danger';
  else if (percentage >= 80) variant = 'warning';

  return (
    <Badge variant={variant} size="sm">
      {percentage.toFixed(1)}%
    </Badge>
  );
};

const StateTransition: FC<{
  previous: Record<string, boolean>;
  next: Record<string, boolean>;
}> = ({ previous, next }) => {
  const changes: string[] = [];

  if (!previous.paused && next.paused) changes.push(translate('Paused'));
  if (previous.paused && !next.paused) changes.push(translate('Unpaused'));
  if (!previous.downscaled && next.downscaled)
    changes.push(translate('Downscaled'));
  if (previous.downscaled && !next.downscaled)
    changes.push(translate('Un-downscaled'));

  if (changes.length === 0) {
    return <span className="text-muted">{translate('No change')}</span>;
  }

  return <span>{changes.join(', ')}</span>;
};

const actionVariant = (
  action: string,
): 'danger' | 'warning' | 'info' | 'secondary' => {
  if (action === 'pause') return 'danger';
  if (action === 'downscale') return 'warning';
  if (action === 'notify') return 'info';
  return 'secondary';
};
