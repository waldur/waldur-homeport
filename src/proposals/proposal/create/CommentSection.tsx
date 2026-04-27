import { FC, PropsWithChildren } from 'react';

import { ReadOnlyFormControl } from '@/form/ReadOnlyFormControl';
import { Proposal, ProposalReview } from '@/proposals/types';

import { AddCommentButton } from '../create-review/AddCommentButton';
import { FieldReviewComments } from '../create-review/FieldReviewComments';

interface CommentSectionProps {
  proposal: Proposal;
  reviews?: ProposalReview[];
  valueField: string;
  commentField: string;
  label?: string;
  tooltip?: string;
  inline?: boolean;
  spaceless?: boolean;
  onAddCommentClick?;
}

export const CommentSection: FC<PropsWithChildren<CommentSectionProps>> = ({
  proposal,
  valueField,
  commentField,
  label,
  tooltip,
  inline,
  spaceless,
  onAddCommentClick,
  reviews,
  children,
}) => (
  <>
    <ReadOnlyFormControl
      label={label}
      value={proposal[valueField]}
      inline={inline}
      spaceless={spaceless}
      tooltip={tooltip}
      actions={
        onAddCommentClick && (
          <AddCommentButton
            review={reviews?.[0]}
            onClick={() => onAddCommentClick({ commentField, label })}
            className={inline ? 'mt-n3' : 'mt-8'}
          />
        )
      }
    >
      {children}
    </ReadOnlyFormControl>
    <div className={onAddCommentClick ? 'me-15' : undefined}>
      <FieldReviewComments reviews={reviews} fieldName={commentField} />
    </div>
  </>
);
