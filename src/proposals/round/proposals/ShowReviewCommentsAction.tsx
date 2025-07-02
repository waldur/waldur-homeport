import { EyeIcon, InfoIcon } from '@phosphor-icons/react';
import { useDispatch } from 'react-redux';
import { ProposalReview } from 'waldur-js-client';

import FormTable from '@waldur/form/FormTable';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { ActionItem } from '@waldur/resource/actions/ActionItem';

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
      closeButton
      iconNode={<InfoIcon weight="bold" />}
    >
      <FormTable hideActions alignTop detailsMode>
        {review.summary_private_comment && (
          <FormTable.Item
            label={translate('Private comment')}
            value={review.summary_private_comment}
          />
        )}
        {review.summary_public_comment && (
          <FormTable.Item
            label={translate('Public comment')}
            value={review.summary_public_comment}
          />
        )}
        {review.comment_project_title && (
          <FormTable.Item
            label={translate('Project title')}
            value={review.comment_project_title}
          />
        )}
        {review.comment_project_summary && (
          <FormTable.Item
            label={translate('Project summary')}
            value={review.comment_project_summary}
          />
        )}
        {review.comment_project_description && (
          <FormTable.Item
            label={translate('Project description')}
            value={review.comment_project_description}
          />
        )}
        {review.comment_project_duration && (
          <FormTable.Item
            label={translate('Project duration')}
            value={review.comment_project_duration}
          />
        )}
        {review.comment_project_has_civilian_purpose && (
          <FormTable.Item
            label={translate('Project has civilian purpose')}
            value={review.comment_project_has_civilian_purpose}
          />
        )}
        {review.comment_project_is_confidential && (
          <FormTable.Item
            label={translate('Project is confidential')}
            value={review.comment_project_is_confidential}
          />
        )}
        {review.comment_project_supporting_documentation && (
          <FormTable.Item
            label={translate('Project supporting documentation')}
            value={review.comment_project_supporting_documentation}
          />
        )}
        {review.comment_resource_requests && (
          <FormTable.Item
            label={translate('Resource requests')}
            value={review.comment_resource_requests}
          />
        )}
        {review.comment_team && (
          <FormTable.Item
            label={translate('Project team')}
            value={review.comment_team}
          />
        )}
      </FormTable>
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
    props.row.comment_project_duration ||
    props.row.comment_project_has_civilian_purpose ||
    props.row.comment_project_is_confidential ||
    props.row.comment_project_supporting_documentation ||
    props.row.comment_resource_requests ||
    props.row.comment_team;

  const dispatch = useDispatch();
  const handleShowComments = () =>
    dispatch(
      openModalDialog(ShowReviewCommentsDialog, {
        review: props.row,
        size: 'lg',
      }),
    );
  return (
    <ActionItem
      action={handleShowComments}
      iconNode={<EyeIcon />}
      title={translate('Show reviewer comments')}
      disabled={!showActionItem}
      tooltip={!showActionItem && translate('No comments available')}
    />
  );
};
