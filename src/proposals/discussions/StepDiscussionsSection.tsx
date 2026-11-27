import { FC, useMemo } from 'react';
import { ProposalWorkflowStepInstance } from 'waldur-js-client';

import { AccordionCard } from 'waldur-ui';

import { translate } from '@/i18n';
import { isMatrixChatEnabled } from '@/matrix/utils';
import {
  sectionOpenProps,
  useSectionOpenState,
} from '@/proposals/proposal/sectionOpen';
import { proposalWorkflowStatesKey } from '@/proposals/workflow/queries';
import { SimpleTable } from '@/table/SimpleTable';
import { Column } from '@/table/types';

import { discussionAction, discussionStateLabel } from './discussionAction';
import { StepDiscussionButton } from './StepDiscussionButton';

export const STEP_DISCUSSIONS_SECTION_ID = 'step-discussions';

/**
 * The proposal's steps that have a discussion the viewer takes part in or
 * oversees, with something to offer; the backend leaves out the rest, and
 * every discussion from applicants. While Matrix chat is disabled, only the
 * closed discussions' records.
 */
export const stepsWithDiscussion = (
  workflowStates: ProposalWorkflowStepInstance[] | undefined,
  chatEnabled = isMatrixChatEnabled(),
): ProposalWorkflowStepInstance[] =>
  (workflowStates ?? []).filter((step) =>
    Boolean(discussionAction(step.discussion, chatEnabled)),
  );

interface StepDiscussionsSectionProps {
  proposalUuid: string;
  workflowStates: ProposalWorkflowStepInstance[] | undefined;
}

/**
 * The discussions of the proposal's steps: a room for the people working on
 * a step, started while it is active and closed with it.
 */
export const StepDiscussionsSection: FC<StepDiscussionsSectionProps> = ({
  proposalUuid,
  workflowStates,
}) => {
  const openState = useSectionOpenState();
  const rows = useMemo(
    () => stepsWithDiscussion(workflowStates),
    [workflowStates],
  );
  const columns = useMemo<Column<ProposalWorkflowStepInstance>[]>(
    () => [
      {
        title: translate('Step'),
        render: ({ row }) => (
          <span className="font-medium text-primary">{row.step_name}</span>
        ),
      },
      {
        title: translate('Discussion'),
        render: ({ row }) => <>{discussionStateLabel(row.discussion!.state)}</>,
      },
      {
        title: '',
        className: 'text-end',
        render: ({ row }) => (
          <StepDiscussionButton
            discussion={row.discussion!}
            target={{ proposal_step_uuid: row.uuid }}
            step={row}
            invalidateQueries={[
              { queryKey: proposalWorkflowStatesKey(proposalUuid) },
            ]}
          />
        ),
      },
    ],
    [proposalUuid],
  );
  if (!rows.length) return null;
  return (
    <AccordionCard
      id={STEP_DISCUSSIONS_SECTION_ID}
      {...sectionOpenProps(openState, STEP_DISCUSSIONS_SECTION_ID, false)}
      title={translate('Discussions')}
      subtitle={translate(
        "End-to-end encrypted chat and video rooms for the people working on a step. Once the step completes, the room's history is kept with the step's record and the room closes.",
      )}
    >
      <SimpleTable columns={columns} rows={rows} />
    </AccordionCard>
  );
};
