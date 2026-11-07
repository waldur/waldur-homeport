import { FC, useMemo } from 'react';
import { Form } from 'react-final-form';
import {
  ProposalRun,
  proposalProposalsRequestExtension,
  proposalProposalsRunsPartialUpdate,
} from 'waldur-js-client';

import { formatDate } from '@/core/dateUtils';
import { formatUsageValue } from '@/core/formatNumber';
import { DateGroup, FormGroup, NumberGroup, SubmitButton } from '@/form';
import { translate } from '@/i18n';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { useAwardedResources } from '@/proposals/awardedResources';
import { getRequestedLines } from '@/proposals/provider-calls/requestedLines';
import { Proposal } from '@/proposals/types';
import { proposalWorkflowStatesKey } from '@/proposals/workflow/queries';

import { cleanRunLimits } from './postAward';
import { proposalRunsKey } from './postAwardQueries';

interface RunFormValues {
  end_date?: string | null;
  limits?: Record<string, Record<string, unknown>>;
}

interface ProposalRunDialogProps {
  resolve: {
    proposal: Proposal;
    /** The run to change; none to request a new extension. */
    run?: ProposalRun;
    /** What the viewer changes: what is asked, or what is granted. */
    mode: 'request' | 'grant';
    refetch?(): void;
  };
}

const asDateString = (value: unknown): string | null => {
  if (!value) return null;
  if (typeof value === 'string') return value.slice(0, 10);
  const date = value as Date;
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};

/**
 * What an extension asks for, or grants: a new end date for the project and
 * its resources, and new limits per resource the award provisioned. The
 * team writes the request while it is open; whoever decides writes the
 * grant, which starts as the request.
 */
export const ProposalRunDialog: FC<ProposalRunDialogProps> = ({
  resolve: { proposal, run, mode, refetch },
}) => {
  const { data: awards } = useAwardedResources(proposal.uuid, true);
  const resources = useMemo(
    () =>
      (awards ?? [])
        .filter((item) => item.resource)
        .map((item) => ({
          uuid: item.resource as string,
          name: item.resource_name || item.requested_offering.offering_name,
          // Named and in units as the offering lists them, not by type key.
          components: getRequestedLines(
            item.limits as Record<string, number>,
            item.requested_offering?.components,
          ),
          limits: (item.limits ?? {}) as Record<string, unknown>,
          // A prepaid resource is extended through a renewal, which the
          // backend holds to: it takes no new limits here.
          prepaid: (item.requested_offering?.components ?? []).some(
            (component) => component.is_prepaid,
          ),
        })),
    [awards],
  );

  const initialValues = useMemo<RunFormValues>(() => {
    const limits =
      (mode === 'grant' ? run?.granted_limits : run?.requested_limits) ?? {};
    return {
      end_date:
        (mode === 'grant' ? run?.granted_end_date : run?.requested_end_date) ??
        null,
      limits: limits as Record<string, Record<string, unknown>>,
    };
  }, [run, mode]);

  const save = useManagedMutation<any, any, RunFormValues>({
    mutationFn: (values) => {
      const endDate = asDateString(values.end_date);
      const limits = cleanRunLimits(values.limits);
      if (!run) {
        return proposalProposalsRequestExtension({
          path: { uuid: proposal.uuid },
          body: { requested_end_date: endDate, requested_limits: limits },
        });
      }
      return proposalProposalsRunsPartialUpdate({
        path: { uuid: proposal.uuid, obj_uuid: run.uuid },
        body:
          mode === 'grant'
            ? { granted_end_date: endDate, granted_limits: limits }
            : { requested_end_date: endDate, requested_limits: limits },
      });
    },
    successMessage: run
      ? translate('The extension has been updated.')
      : translate('The extension request has been opened.'),
    errorMessage: translate('Unable to save the extension.'),
    refetch,
    invalidateQueries: [
      { queryKey: proposalRunsKey(proposal.uuid) },
      { queryKey: proposalWorkflowStatesKey(proposal.uuid) },
    ],
  });

  const title =
    mode === 'grant'
      ? translate('What the extension grants')
      : run
        ? translate('What the extension asks for')
        : translate('Request an extension');

  return (
    <Form<RunFormValues>
      initialValues={initialValues}
      onSubmit={(values) => save.mutateAsync(values)}
      render={({ handleSubmit, submitting }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={title}
            subtitle={
              mode === 'grant'
                ? translate(
                    'The project and the resources of the offerings whose team accepted the extension move to the new end date once it is approved. More resources are ordered from those offerings, whose providers approve the orders as usual.',
                  )
                : translate(
                    'Say what the project needs: a new end date, more resources, or both. Explain why in the form of the request step before you submit it.',
                  )
            }
            footer={
              <>
                <CloseDialogButton variant="tertiary" />
                <SubmitButton
                  submitting={submitting}
                  label={translate('Save')}
                />
              </>
            }
          >
            <DateGroup
              name="end_date"
              label={translate('New end date')}
              description={
                proposal.extension_requestable_until
                  ? translate('Requests are taken until {date}.', {
                      date: formatDate(proposal.extension_requestable_until),
                    })
                  : undefined
              }
            />
            {resources.map((resource) => (
              <FormGroup
                key={resource.uuid}
                label={translate('Limits of {resource}', {
                  resource: resource.name,
                })}
              >
                {resource.prepaid ? (
                  <p className="text-quaternary mb-0">
                    {translate(
                      'Prepaid: it is renewed on its own. This request extends neither its limits nor its end date.',
                    )}
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5">
                    {resource.components.map((component) => (
                      <div key={component.key}>
                        <NumberGroup
                          name={`limits.${resource.uuid}.${component.key}`}
                          label={
                            component.unit
                              ? `${component.label} (${component.unit})`
                              : component.label
                          }
                          description={translate('Awarded: {amount}', {
                            amount: formatUsageValue(component.amount),
                          })}
                          min={0}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </FormGroup>
            ))}
          </ModalDialog>
        </form>
      )}
    />
  );
};
