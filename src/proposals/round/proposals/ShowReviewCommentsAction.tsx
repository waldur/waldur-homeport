import { EyeIcon, InfoIcon } from '@phosphor-icons/react';
import { ProposalReview } from 'waldur-js-client';

import { PropertyList, PropertyItem } from 'waldur-ui';

import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { ModalDialog } from '@/modal/ModalDialog';
import { ActionItem } from '@/resource/actions/ActionItem';

interface ShowReviewCommentsActionProps {
  review: ProposalReview;
}

const ShowReviewCommentsDialog = ({
  review,
}: ShowReviewCommentsActionProps) => {
  return (
    <ModalDialog
      title={translate('Comments by {reviewer}', {
        reviewer: review.reviewer_full_name,
      })}
      iconNode={<InfoIcon weight="bold" />}
    >
      <PropertyList hideActions alignTop detailsMode hideIfEmpty>
        <PropertyItem
          label={translate('Private comment')}
          value={review.summary_private_comment}
        />
        <PropertyItem
          label={translate('Public comment')}
          value={review.summary_public_comment}
        />
        <PropertyItem
          label={translate('Project title')}
          value={review.comment_project_title}
        />
        <PropertyItem
          label={translate('Project summary')}
          value={review.comment_project_summary}
        />
        <PropertyItem
          label={translate('Project description')}
          value={review.comment_project_description}
        />
        <PropertyItem
          label={translate('Project supporting documentation')}
          value={review.comment_project_supporting_documentation}
        />
        <PropertyItem
          label={translate('Resource requests')}
          value={review.comment_resource_requests}
        />
        <PropertyItem
          label={translate('Project team')}
          value={review.comment_team}
        />
      </PropertyList>
    </ModalDialog>
  );
};

export const ShowReviewCommentsAction = (props) => {
  const showActionItem =
    props.row.summary_public_comment ||
    props.row.summary_private_comment ||
    props.row.comment_project_title ||
    props.row.comment_project_summary ||
    props.row.comment_project_description ||
    props.row.comment_project_supporting_documentation ||
    props.row.comment_resource_requests ||
    props.row.comment_team;

  const { openDialog } = useModal();
  const handleShowComments = () =>
    openDialog(ShowReviewCommentsDialog, {
      review: props.row,
      size: 'lg',
    });
  return (
    <ActionItem
      action={handleShowComments}
      iconNode={<EyeIcon weight="bold" />}
      title={translate('Show reviewer comments')}
      disabled={!showActionItem}
      tooltip={!showActionItem && translate('No comments available')}
    />
  );
};
