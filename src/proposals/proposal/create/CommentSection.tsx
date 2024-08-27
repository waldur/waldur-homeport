import { FC, PropsWithChildren } from 'react';

import { ReadOnlyFormControl } from '@waldur/form/ReadOnlyFormControl';
import { Proposal, ProposalReview } from '@waldur/proposals/types';

import { AddCommentButton } from '../create-review/AddCommentButton';
import { FieldReviewComments } from '../create-review/FieldReviewComments';

interface CommentSectionProps {
  proposal: Proposal;
  reviews?: ProposalReview[];
  valueField: string;
  commentField: string;
  label: string;
  tooltip: string;
  floating?: boolean;
  inline?: boolean;
  onAddCommentClick?;
}

export const CommentSection: FC<PropsWithChildren<CommentSectionProps>> = ({
  proposal,
  valueField,
  commentField,
  label,
  tooltip,
  floating,
  inline,
  onAddCommentClick,
  reviews,
  children,
}) => (
  <>
    <ReadOnlyFormControl
      label={label}
      value={proposal[valueField]}
      floating={floating}
      inline={inline}
      tooltip={tooltip}
      actions={
        onAddCommentClick && (
          <AddCommentButton
            review={reviews?.[0]}
            onClick={() => onAddCommentClick({ commentField, label })}
            className={floating ? '' : 'mt-11'}
          />
        )
      }
    >
      {children}
    </ReadOnlyFormControl>
    <FieldReviewComments reviews={reviews} fieldName={commentField} />
  </>
);
