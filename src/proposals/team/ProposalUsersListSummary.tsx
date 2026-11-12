import { FC, useCallback } from 'react';
import { proposalProposalsListUsersList } from 'waldur-js-client';

import { AccordionCard, LinkButton } from 'waldur-ui';

import { formatJsxTemplate, translate } from '@/i18n';
import { PROPOSAL_ACTIVITY_SECTION_ID } from '@/proposals/activity/ProposalActivitySection';
import { PROPOSAL_FLUSH_TABLE_CLASS } from '@/proposals/flushTable';
import { Proposal } from '@/proposals/types';
import { createFetcher } from '@/table/api';
import { useTable } from '@/table/useTable';

import {
  applicantChangeNote,
  useActingForApplicant,
  useConfirmApplicantChange,
} from '../proposal/actingForApplicant';
import { FieldReviewComments } from '../proposal/create-review/FieldReviewComments';
import { useSectionOpenState } from '../proposal/sectionOpen';

import { isAccessDenied } from './teamApi';
import { TeamDropdownActions } from './TeamDropdownActions';
import { useProposalTeamRules } from './useProposalTeamRules';
import { UsersList } from './UsersList';

/**
 * The collapsible card the proposal page lists the team in. Given, the list
 * renders it itself, so that adding someone sits in the card's header -- in
 * sight while the card is collapsed, as it does for the award.
 */
interface TeamSection {
  id: string;
  title: string;
  subtitle?: string;
  /** The card's open state, as `sectionOpenProps` gives it. */
  openProps: Record<string, any>;
}

export const ProposalUsersListSummary: FC<{
  scope: Proposal;
  reviews?;
  // Set by the proposal detail for reviewer-only viewers: role expiration is
  // team-admin metadata concealed from reviewers (backend also drops it).
  hideExpiration?: boolean;
  section?: TeamSection;
}> = (props) => {
  const usersTable = useTable({
    table: `ProposalUsersList`,
    fetchData: createFetcher(proposalProposalsListUsersList, {
      path: { uuid: props.scope.uuid },
    }),
    // A viewer who may not read the team gets a 403: no access, not an
    // error, so the section renders nothing instead of leaving the page.
    meta: { skipGlobalErrorRedirect: true },
  });

  // Once the proposal is submitted, staff and the call's managers and
  // organisers may still change its team; the applicant team sees it
  // read-only.
  const rules = useProposalTeamRules(props.scope);
  const fetchUsers = usersTable.fetch;
  const { onTeamChange } = rules;
  const refetchUsers = useCallback(() => {
    fetchUsers();
    onTeamChange();
  }, [fetchUsers, onTeamChange]);

  // Who changed the team, and when, is part of the proposal's activity.
  const openState = useSectionOpenState();
  const showActivity = useCallback(() => {
    openState?.setOpen(PROPOSAL_ACTIVITY_SECTION_ID, true);
    document
      .getElementById(PROPOSAL_ACTIVITY_SECTION_ID)
      ?.scrollIntoView({ behavior: 'smooth' });
  }, [openState]);

  // After submission the team is the applicant's; staff and the call team
  // change it only as an exception, so adding is not offered as the call to
  // action, and every change says it is made for the applicant.
  const actingForApplicant = useActingForApplicant(props.scope);
  const confirmChange = useConfirmApplicantChange(props.scope);
  const confirmAdd = useCallback(
    () =>
      confirmChange(translate('Add someone to the applicant team.'), {
        title: translate('Change the applicant team'),
        applicantTold: false,
      }),
    [confirmChange],
  );

  const addActions = rules.dropdown ? (
    <TeamDropdownActions
      scope={props.scope}
      roleTypes={['proposal']}
      {...rules.dropdown}
      refetchUsers={refetchUsers}
      variant={actingForApplicant ? 'tertiary' : undefined}
      beforeOpen={actingForApplicant ? confirmAdd : undefined}
    />
  ) : null;

  const usersList = (
    <>
      {addActions && !props.section ? (
        <div className="flex justify-end pt-2.5">{addActions}</div>
      ) : null}
      {rules.teamNote ? (
        <p className="text-quaternary py-2.5 mb-0">{rules.teamNote}</p>
      ) : null}
      <UsersList
        table={usersTable}
        scope={props.scope}
        scopeType="proposal"
        hideRole={false}
        hideExpiration={props.hideExpiration}
        readOnly={rules.readOnly}
        canRemoveRow={rules.canRemoveRow}
        getRemoveDisabledReason={rules.getRemoveDisabledReason}
        removeConfirmationNote={
          actingForApplicant ? applicantChangeNote(false) : undefined
        }
        refetch={refetchUsers}
        // A frame only to set it apart from the comments below it.
        cardBordered={Boolean(
          props.reviews?.some((review) => review?.comment_team),
        )}
        hasActionBar={false}
      />
      {/* About the whole team, not a row of it: below the table. */}
      <FieldReviewComments
        reviews={props.reviews}
        fieldName="comment_team"
        nested
        space={0}
        className="mt-4"
      />
    </>
  );

  if (isAccessDenied(usersTable.error)) {
    return null;
  }

  const body = (
    <div className={PROPOSAL_FLUSH_TABLE_CLASS}>
      {usersList}
      {openState ? (
        <p className="text-quaternary pt-2.5 mb-0">
          {translate(
            'Who added or removed whom, and when, is listed under {activity}.',
            {
              activity: (
                <LinkButton variant="subtle" onClick={showActivity}>
                  {translate('Activity')}
                </LinkButton>
              ),
            },
            formatJsxTemplate,
          )}
        </p>
      ) : null}
    </div>
  );

  if (!props.section) {
    return body;
  }
  const { section } = props;
  return (
    <AccordionCard
      id={section.id}
      title={section.title}
      subtitle={section.subtitle}
      actions={addActions ?? undefined}
      {...section.openProps}
    >
      {body}
    </AccordionCard>
  );
};
