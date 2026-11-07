import { UserPlusIcon } from '@phosphor-icons/react';
import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo } from 'react';
import { Form, useForm } from 'react-final-form';
import {
  CallProposalRole,
  proposalProposalsRoleAssignmentCandidatesList,
  proposalProposalsRoleAssignmentsSet,
  ProposalRoleCandidate,
} from 'waldur-js-client';

import { AlertItem } from 'waldur-ui';

import { Link } from '@/core/Link';
import { required } from '@/core/validators';
import {
  AsyncSelectGroup,
  BooleanGroup,
  SelectGroup,
  SubmitButton,
} from '@/form';
import { translate } from '@/i18n';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { PermissionEnum } from '@/permissions/enums';
import { hasPermission } from '@/permissions/hasPermission';
import { useUser } from '@/workspace/hooks';

import {
  eligibilityLabel,
  emptyPoolMessage,
} from '../../proposal-roles/constants';
import { MY_PROPOSAL_ROLE_ASSIGNMENTS_KEY } from '../../proposal-roles/queries';
import { Proposal } from '../../types';

interface AssignEvaluatorValues {
  role_uuid: string;
  user: ProposalRoleCandidate | null;
  is_lead: boolean;
}

/**
 * Why the backend would refuse the candidate, or undefined. A conflict is
 * known only to the call team; for anyone else it is null and says nothing.
 */
export const candidateUnavailableReason = (
  candidate: ProposalRoleCandidate,
) => {
  if (candidate.has_recorded_conflict) {
    return translate('conflict of interest recorded');
  }
  if (candidate.holds_role) {
    return translate('already holds the role');
  }
  if (candidate.holds_other_role) {
    return translate('already {role} on this proposal', {
      role: candidate.held_role_name,
    });
  }
  return undefined;
};

const candidateLabel = (candidate: ProposalRoleCandidate) => {
  const name = candidate.full_name || candidate.username;
  const who = candidate.email ? `${name} (${candidate.email})` : name;
  const reason = candidateUnavailableReason(candidate);
  return reason ? `${who} — ${reason}` : who;
};

const CandidateField = ({
  proposal,
  role,
}: {
  proposal: Proposal;
  role: CallProposalRole | undefined;
}) => {
  const searchRequired = role?.eligible_from === 'any_user';
  // The backend searches by name and username, and by email -- by part of it
  // for the call team, by the whole address for anyone else -- and lists at
  // most a page of matches; anyone may hold an any-user role, so it lists
  // nobody until asked for someone.
  const loadOptions = useCallback(
    async (search: string) => {
      if (!role) {
        return { options: [], hasMore: false };
      }
      const response = await proposalProposalsRoleAssignmentCandidatesList({
        path: { uuid: proposal.uuid },
        query: { role_uuid: role.uuid, query: search || undefined },
      });
      return { options: response.data ?? [], hasMore: false };
    },
    [proposal.uuid, role],
  );
  return (
    <AsyncSelectGroup
      // A new role is a new list of candidates.
      key={role?.uuid ?? 'none'}
      name="user"
      label={translate('Evaluator')}
      description={
        role
          ? searchRequired
            ? translate(
                'Anyone may hold this role: search by name, username or full email address.',
              )
            : translate(
                'Eligible: {who}. Search by name, username or full email address.',
                { who: eligibilityLabel(role.eligible_from).toLowerCase() },
              )
          : undefined
      }
      required={true}
      loadOptions={loadOptions}
      defaultOptions={!searchRequired}
      getOptionValue={(candidate: ProposalRoleCandidate) => candidate.uuid}
      getOptionLabel={candidateLabel}
      // The backend refuses each of these; say why instead of letting them
      // be picked.
      isOptionDisabled={(candidate: ProposalRoleCandidate) =>
        Boolean(candidateUnavailableReason(candidate))
      }
      isClearable={true}
      isDisabled={!role}
      placeholder={translate('Search...')}
      validate={required}
      noOptionsMessage={({ inputValue }) =>
        searchRequired && !inputValue
          ? translate('Type a name, username or full email address to search.')
          : // Nothing listed before any search: nobody is eligible on this
            // proposal, and the role's kind says why.
            (!inputValue && role && emptyPoolMessage(role.eligible_from)) ||
            translate('Nobody eligible matches.')
      }
    />
  );
};

/** A lead the viewer may no longer give, after switching roles, is unset. */
const ClearRefusedLead = ({ refused }: { refused: boolean }) => {
  const form = useForm<AssignEvaluatorValues>();
  useEffect(() => {
    if (refused && form.getState().values.is_lead) {
      form.change('is_lead', false);
    }
  }, [refused, form]);
  return null;
};

export const AssignEvaluatorDialog = ({
  resolve,
}: {
  resolve: {
    proposal: Proposal;
    roles: CallProposalRole[];
    initialRole?: string;
    /**
     * Why the viewer may not make the new holder of a role its lead, when
     * they may not: a peer while the role has a lead of someone else.
     */
    leadRefusal?(roleUuid: string): string | undefined;
    refetch(): void;
  };
}) => {
  const { proposal, roles, refetch } = resolve;
  const user = useUser();
  // The Team tab is offered to those who may change the call's team.
  const canManageTeam =
    user?.is_staff ||
    hasPermission(user, {
      permission: PermissionEnum.UPDATE_CALL,
      scopeId: proposal.call_uuid,
      callOrganizerId: proposal.call_managing_organisation_uuid,
    });
  const roleOptions = useMemo(
    () => roles.map((role) => ({ value: role.uuid, label: role.name })),
    [roles],
  );
  const initialValues = useMemo(
    () => ({
      role_uuid:
        resolve.initialRole ?? (roles.length === 1 ? roles[0].uuid : null),
      user: null,
      is_lead: false,
    }),
    [resolve.initialRole, roles],
  );

  const queryClient = useQueryClient();
  const mutation = useManagedMutation<any, any, AssignEvaluatorValues>({
    mutationFn: (values) =>
      proposalProposalsRoleAssignmentsSet({
        path: { uuid: proposal.uuid },
        body: {
          role_uuid: values.role_uuid,
          user_uuid: values.user.uuid,
          is_lead: !!values.is_lead,
        },
      }),
    successMessage: translate('The evaluator has been assigned.'),
    errorMessage: translate('Unable to assign the evaluator.'),
    refetch: () => {
      refetch();
      // The assignee may be the viewer, whose own roles open the proposal.
      queryClient.invalidateQueries({
        queryKey: [MY_PROPOSAL_ROLE_ASSIGNMENTS_KEY],
      });
    },
  });

  return (
    <Form<AssignEvaluatorValues>
      initialValues={initialValues}
      onSubmit={(values) => mutation.mutateAsync(values)}
      render={({ handleSubmit, submitting, invalid, values }) => {
        const role = roles.find((r) => r.uuid === values.role_uuid);
        const leadRefusal = role ? resolve.leadRefusal?.(role.uuid) : undefined;
        return (
          <form onSubmit={handleSubmit}>
            <ModalDialog
              title={translate('Assign evaluator')}
              subtitle={translate(
                'Evaluators read the proposal as the call shows it to reviewers. The applicant does not see who they are.',
              )}
              iconNode={<UserPlusIcon weight="bold" />}
              iconColor="success"
              footer={
                <>
                  <CloseDialogButton className="min-w-[125px]" />
                  <SubmitButton
                    submitting={submitting}
                    disabled={invalid}
                    label={translate('Assign')}
                    variant="primary"
                    className="min-w-[125px]"
                  />
                </>
              }
            >
              <SelectGroup
                name="role_uuid"
                label={translate('Role')}
                required={true}
                options={roleOptions}
                simpleValue={true}
                isClearable={false}
                validate={required}
              />
              <CandidateField proposal={proposal} role={role} />
              {role?.holders_warning && (
                <AlertItem
                  variant="warning"
                  type="floating"
                  className="mb-4"
                  title={
                    (role.eligible_count === 0 &&
                      emptyPoolMessage(role.eligible_from)) ||
                    role.holders_warning
                  }
                  data-testid="empty-pool"
                  body={
                    canManageTeam ? (
                      <Link
                        state="protected-call.main"
                        params={{ call_uuid: proposal.call_uuid, tab: 'team' }}
                        label={translate("Open the call's Team tab")}
                      />
                    ) : undefined
                  }
                />
              )}
              {role?.allows_lead && (
                <BooleanGroup
                  name="is_lead"
                  spaceless={true}
                  label={translate('Lead')}
                  disabled={Boolean(leadRefusal)}
                  description={
                    leadRefusal ||
                    translate(
                      'Marks this holder as the lead of the role, in place of any other.',
                    )
                  }
                />
              )}
              <ClearRefusedLead refused={Boolean(leadRefusal)} />
            </ModalDialog>
          </form>
        );
      }}
    />
  );
};
