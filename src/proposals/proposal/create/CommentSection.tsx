import { FC, PropsWithChildren } from 'react';

import { ReadOnlyFormControl } from '@waldur/form/ReadOnlyFormControl';
import { Proposal, ProposalReview } from '@waldur/proposals/types';

import { AddCommentButton } from '../create-review/AddCommentButton';
import { FieldReviewComments } from '../create-review/FieldReviewComments';

import { QuestionMark } from './QuestionMark';

interface CommentSectionProps {
  proposal: Proposal;
  reviews?: ProposalReview[];
  valueField: string;
  commentField: string;
  label: string;
  tooltip: string;
  onAddCommentClick?;
}

export const CommentSection: FC<PropsWithChildren<CommentSectionProps>> = ({
  proposal,
  valueField,
  commentField,
  label,
  tooltip,
  onAddCommentClick,
  reviews,
  children,
}) => (
  <>
    <ReadOnlyFormControl
      label={label}
      value={proposal[valueField]}
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
