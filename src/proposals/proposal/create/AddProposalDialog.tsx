import { PlusCircleIcon } from '@phosphor-icons/react';
import { useRouter } from '@uirouter/react';
import { FC, useEffect, useMemo } from 'react';
import { Form } from 'react-final-form';
import {
  NestedRound,
  Offering,
  proposalProposalsCreate,
  proposalProposalsResourcesSet,
  PublicCall,
} from 'waldur-js-client';

import { required } from '@/core/validators';
import { SubmitButton, StringGroup } from '@/form';
import { formatJsxTemplate, translate } from '@/i18n';
import { hasCallVocabulary } from '@/marketplace/serviceAccessMode';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';
import {
  checkProjectNameRegex,
  getProjectNameRestrictionHint,
} from '@/project/validators';
import { EndingField } from '@/proposals/EndingField';
import { getProposalProjectName } from '@/proposals/proposalProjectName';
import { Call } from '@/proposals/types';
import { Field } from '@/resource/summary';
import { useNotify } from '@/store/notify';
import { UsersService } from '@/user/UsersService';

interface FormData {
  name: string;
}

interface AddProposalDialogProps {
  resolve: {
    round: NestedRound;
    call: Call | PublicCall;
    /** When set, the offering is attached to the new proposal as a resource request. */
    offering?: Offering;
  };
}

export const AddProposalDialog: FC<AddProposalDialogProps> = (props) => {
  const router = useRouter();
  const { showError, showErrorResponse } = useNotify();

  // The call's entry for this offering: it carries the plan and components the
  // amounts are priced against, and the call manager's purchase-order setting.
  const requestedOffering = useMemo(() => {
    const offering = props.resolve.offering;
    if (!offering) {
      return undefined;
    }
    return props.resolve.call.offerings?.find(
      (item) =>
        item.offering_uuid === offering.uuid && item.state === 'accepted',
    );
  }, [props.resolve.call, props.resolve.offering]);

  // The amounts the call manager published for this offering. Attaching an
  // offering used to create a request asking for nothing, which read as a
  // priced row costing zero and counted towards a complete proposal. Starting
  // from the call's own template gives the applicant a figure to adjust rather
  // than an empty one to discover.
  const templateLimits = useMemo(() => {
    if (!requestedOffering) {
      return undefined;
    }
    const template = (props.resolve.call as any).resource_templates?.find(
      (item) => item.requested_offering_uuid === requestedOffering.uuid,
    );
    return template?.limits && Object.keys(template.limits).length
      ? (template.limits as Record<string, number>)
      : undefined;
  }, [props.resolve.call, requestedOffering]);

  // The name is carried into the project created on approval, so it is held to
  // the deployment's project-name pattern — same rule the backend applies in
  // ProposalSerializer.validate_name. That rule is the only description worth
  // showing: the placeholder already says to name the project, and the preview
  // below shows what the name becomes, so a sentence between them was only
  // something more to read.
  const nameDescription = getProjectNameRestrictionHint();
  const validateName = (value: string) =>
    required(value) || checkProjectNameRegex(value);

  useEffect(() => {
    // Delay focus to run after modal animation and autoFocus complete (~150ms)
    const timer = setTimeout(() => {
      const input =
        document.querySelector<HTMLInputElement>('input[name="name"]');
      input?.focus();
    }, 200);
    return () => clearTimeout(timer);
  }, []);

  const { mutate, isPending } = useManagedMutation({
    mutationFn: async (values: FormData) => {
      const response = await proposalProposalsCreate({
        body: {
          name: values.name,
          round_uuid: props.resolve.round.uuid,
        },
      });
      const offering = props.resolve.offering;
      if (offering) {
        const attachFailed = translate(
          'The offering could not be attached automatically. Please add it in the resource requests step.',
        );
        if (!requestedOffering) {
          // Don't hand back a proposal named after an offering it lacks.
          showError(attachFailed);
        } else {
          try {
            await proposalProposalsResourcesSet({
              path: { uuid: response.data.uuid },
              body: {
                requested_offering_uuid: requestedOffering.uuid,
                attributes: {},
                // The call's published amounts, else nothing. This dialog only
                // names the proposal; the amounts and the purchase order are
                // the resource-request step's job on the proposal page.
                limits: templateLimits || {},
                purchase_order_reference: '',
              },
            });
          } catch (error) {
            // The backend names the actual constraint; the sentence alone does not.
            showErrorResponse(error, attachFailed);
          }
        }
      }
      return response;
    },
    onSuccess: (response) => {
      UsersService.refreshCurrentUser();
      router.stateService.go('proposals.manage-proposal', {
        proposal_uuid: response.data.uuid,
      });
    },
    successMessage: translate('Proposal created successfully'),
  });

  return (
    // Deliberately no initial name: it becomes the project name on approval, so
    // defaulting it to the offering would have every applicant to a call
    // propose the same one — and name their project after the product rather
    // than their work.
    <Form<FormData>
      onSubmit={mutate}
      render={({ handleSubmit, invalid, submitting, values }) => {
        const projectName = getProposalProjectName(
          props.resolve.call,
          props.resolve.round,
          values.name,
        );
        return (
          <form onSubmit={handleSubmit}>
            <ModalDialog
              title={
                hasCallVocabulary()
                  ? translate('Create proposal')
                  : translate('Request access')
              }
              iconNode={<PlusCircleIcon weight="bold" />}
              iconColor="success"
              footer={
                <>
                  <CloseDialogButton
                    variant="tertiary"
                    className="min-w-125px"
                  />
                  <SubmitButton
                    disabled={invalid}
                    submitting={submitting || isPending}
                    // The dialog's title already says which of the two this
                    // is; the button just needs the verb every other create
                    // dialog in the app uses.
                    label={translate('Create')}
                    className="btn btn-primary min-w-125px"
                  />
                </>
              }
            >
              <Field
                label={
                  hasCallVocabulary()
                    ? translate('Call name')
                    : translate('Available under')
                }
                value={props.resolve.call.name}
                labelCol={4}
                valueCol={8}
                space={2}
              />
              {hasCallVocabulary() ? (
                <Field
                  label={translate('Round reference')}
                  value={props.resolve.round.name}
                  labelCol={4}
                  valueCol={8}
                  space={2}
                />
              ) : null}
              <Field
                label={
                  hasCallVocabulary()
                    ? translate('Round deadline')
                    : translate('Submission closes')
                }
                value={
                  <EndingField
                    endDate={props.resolve.round.cutoff_time}
                    dateFirst
                    hasFixedDuration={Boolean(
                      props.resolve.call.fixed_duration_in_days,
                    )}
                  />
                }
                labelCol={4}
                valueCol={8}
                space={2}
              />
              <div className="mt-7">
                <StringGroup
                  label={translate('Name')}
                  name="name"
                  placeholder={translate('Name your project')}
                  required
                  validate={validateName}
                  description={nameDescription}
                  spaceless
                  disabled={submitting || isPending}
                />
                {/* The applicant's name is only the last third of what the
                    project ends up called, so show the whole thing rather than
                    describing the rule in prose. */}
                {projectName ? (
                  <div className="text-muted fs-7 mt-2">
                    {translate(
                      'Project name: {name}',
                      { name: <strong>{projectName}</strong> },
                      formatJsxTemplate,
                    )}
                  </div>
                ) : null}
              </div>
            </ModalDialog>
          </form>
        );
      }}
    />
  );
};
