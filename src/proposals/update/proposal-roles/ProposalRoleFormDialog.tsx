import { PlusCircleIcon } from '@phosphor-icons/react';
import { useMemo } from 'react';
import { Form } from 'react-final-form';
import {
  CallProposalRole,
  proposalProtectedCallsProposalRolesPartialUpdate,
  proposalProtectedCallsProposalRolesSet,
} from 'waldur-js-client';

import { required } from '@/core/validators';
import {
  BooleanGroup,
  NumberGroup,
  SelectGroup,
  StringGroup,
  SubmitButton,
  TextGroup,
} from '@/form';
import { translate } from '@/i18n';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';

import {
  eligibilityLabel,
  PROPOSAL_ROLE_ELIGIBILITY_OPTIONS,
  ProposalRoleEligibility,
} from '../../proposal-roles/constants';
import { Call } from '../../types';

interface ProposalRoleFormValues {
  name: string;
  description: string;
  eligible_from: ProposalRoleEligibility;
  min_holders: number;
  max_holders: number | null;
  allows_lead: boolean;
}

const EMPTY_VALUES: ProposalRoleFormValues = {
  name: '',
  description: '',
  eligible_from: 'call_role:panel_member',
  min_holders: 1,
  max_holders: 1,
  allows_lead: false,
};

const validateHolders = (values: ProposalRoleFormValues) =>
  values.max_holders != null &&
  values.min_holders != null &&
  Number(values.min_holders) > Number(values.max_holders)
    ? {
        min_holders: translate(
          'Cannot be more than the maximum number of holders.',
        ),
      }
    : {};

export const ProposalRoleFormDialog = ({
  resolve,
}: {
  resolve: { call: Call; role?: CallProposalRole; refetch(): void };
}) => {
  const { call, role, refetch } = resolve;
  const isEdit = Boolean(role);

  const initialValues = useMemo<ProposalRoleFormValues>(
    () =>
      role
        ? {
            name: role.name,
            description: role.description ?? '',
            eligible_from: role.eligible_from as ProposalRoleEligibility,
            min_holders: role.min_holders ?? 1,
            max_holders: role.max_holders ?? null,
            allows_lead: role.allows_lead ?? false,
          }
        : EMPTY_VALUES,
    [role],
  );

  const eligibilityOptions = useMemo(
    () =>
      PROPOSAL_ROLE_ELIGIBILITY_OPTIONS.map((value) => ({
        value,
        label: eligibilityLabel(value),
      })),
    [],
  );

  const mutation = useManagedMutation<any, any, ProposalRoleFormValues>({
    mutationFn: (values) => {
      const body = {
        name: values.name.trim(),
        description: values.description ?? '',
        eligible_from: values.eligible_from,
        min_holders: Number(values.min_holders) || 1,
        max_holders:
          values.max_holders === null || (values.max_holders as any) === ''
            ? null
            : Number(values.max_holders),
        allows_lead: !!values.allows_lead,
      };
      return isEdit
        ? proposalProtectedCallsProposalRolesPartialUpdate({
            path: { uuid: call.uuid, obj_uuid: role.uuid },
            body,
          })
        : proposalProtectedCallsProposalRolesSet({
            path: { uuid: call.uuid },
            body,
          });
    },
    successMessage: isEdit
      ? translate('The evaluator role has been updated.')
      : translate('The evaluator role has been added.'),
    errorMessage: isEdit
      ? translate('Unable to update the evaluator role.')
      : translate('Unable to add the evaluator role.'),
    refetch,
  });

  return (
    <Form<ProposalRoleFormValues>
      initialValues={initialValues}
      validate={validateHolders}
      onSubmit={(values) => mutation.mutateAsync(values)}
      render={({ handleSubmit, submitting, invalid }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={
              isEdit
                ? translate('Edit evaluator role')
                : translate('Add evaluator role')
            }
            subtitle={translate(
              'People who hold the role evaluate a proposal, for example as its lead or second rapporteur. They are not part of the applicant team.',
            )}
            iconNode={!isEdit ? <PlusCircleIcon weight="bold" /> : null}
            iconColor={isEdit ? 'warning' : 'success'}
            footer={
              <>
                <CloseDialogButton />
                <SubmitButton
                  submitting={submitting}
                  disabled={invalid}
                  label={isEdit ? translate('Update') : translate('Add')}
                  variant="primary"
                />
              </>
            }
          >
            <StringGroup
              name="name"
              label={translate('Name')}
              required={true}
              validate={required}
              maxLength={255}
            />
            <TextGroup
              name="description"
              label={translate('Description')}
              rows={2}
            />
            <SelectGroup
              name="eligible_from"
              label={translate('Who may hold it')}
              required={true}
              options={eligibilityOptions}
              simpleValue={true}
              isClearable={false}
              validate={required}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5">
              <div>
                <NumberGroup
                  name="min_holders"
                  label={translate('Required holders')}
                  description={translate(
                    'An assignment step for the role completes once this many are assigned.',
                  )}
                  min={1}
                  required={true}
                  validate={required}
                />
              </div>
              <div>
                <NumberGroup
                  name="max_holders"
                  label={translate('Maximum holders')}
                  description={translate(
                    'Per proposal. Leave empty for no limit.',
                  )}
                  min={1}
                />
              </div>
            </div>
            <BooleanGroup
              name="allows_lead"
              spaceless={true}
              label={translate('Has a lead')}
              description={translate(
                'One holder is marked as the lead, for example the rapporteur who writes the consolidated report.',
              )}
            />
          </ModalDialog>
        </form>
      )}
    />
  );
};
