import { FC } from 'react';

import { ReadOnlyFormControl } from '@waldur/form/ReadOnlyFormControl';
import { Proposal, ProposalReview } from '@waldur/proposals/types';

import { AddCommentButton } from '../create-review/AddCommentButton';
import { FieldReviewComments } from '../create-review/FieldReviewComments';

import { QuestionMark } from './QuestionMark';

export const CommentSection: FC<{
  proposal: Proposal;
  reviews?: ProposalReview[];
  valueField: string;
  commentField: string;
  label: string;
  tooltip: string;
  floating?: boolean;
  onAddCommentClick?;
}> = ({
  proposal,
  valueField,
  commentField,
  label,
  tooltip,
  floating,
  onAddCommentClick,
  reviews,
  children,
}) => (
  <>
    <ReadOnlyFormControl
      label={label}
      value={proposal[valueField]}
      floating={floating}
      actions={
        <>
          <QuestionMark tooltip={tooltip} />
          {onAddCommentClick && (
            <AddCommentButton
              onClick={() => onAddCommentClick({ commentField, label })}
            />
          )}
        </>
      }
    >
      {children}
    </ReadOnlyFormControl>
    <FieldReviewComments reviews={reviews} fieldName={commentField} />
  </>
);
