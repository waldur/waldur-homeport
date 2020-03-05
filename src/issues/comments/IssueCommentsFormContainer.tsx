import * as React from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { reduxForm, InjectedFormProps } from 'redux-form';

import { IssueAttachmentsList } from '@waldur/issues/attachments/IssueAttachmentsList';
import { getUploading } from '@waldur/issues/attachments/selectors';
import { Attachment } from '@waldur/issues/attachments/types';

import * as actions from './actions';
import * as constants from './constants';
import { IssueCommentsForm } from './IssueCommentsForm';
import {
  getCommentFormIsOpen,
  getPendingAttachments,
  getIsUiDisabled,
} from './selectors';

interface PureIssueCommentsFormContainerProps extends InjectedFormProps {
  opened: boolean;
  formId: string;
  defaultMessage: string;
  attachments: Attachment[];
  uploadingAttachments: number;
  uiDisabled: boolean;
  formToggle(): void;
  onSubmit(data: { [key: string]: string }): Promise<void>;
  cancelSubmit(): void;
  deletePendingAttachments(): void;
}

const onCancel = (props: PureIssueCommentsFormContainerProps) => () => {
  const {
    reset,
    deletePendingAttachments,
    formToggle,
    submitting,
    cancelSubmit,
  } = props;

  if (!submitting) {
    reset();
    deletePendingAttachments();
    formToggle();
  }
  cancelSubmit();
};

export const PureIssueCommentsFormContainer = (
  props: PureIssueCommentsFormContainerProps,
) => {
  const { attachments, uploadingAttachments, opened } = props;

  if (!opened) {
    return null;
  }
  return (
    <div>
      <IssueCommentsForm {...props} onCancel={onCancel(props)} />
      <IssueAttachmentsList
        attachments={attachments}
        uploading={uploadingAttachments}
      />
    </div>
  );
};

const mapStateToProps = (state, ownProps) => ({
  opened: getCommentFormIsOpen(state, ownProps),
  uploadingAttachments: getUploading(state),
  attachments: getPendingAttachments(state),
  uiDisabled: getIsUiDisabled(state),
  form: ownProps.formId,
  initialValues: {
    [constants.FORM_FIELDS.comment]: ownProps.defaultMessage,
  },
});

const mapDispatchToProps = (dispatch, ownProps) => ({
  formToggle: (): void =>
    dispatch(actions.issueCommentsFormToggle(ownProps.formId)),
  onSubmit: (data: { [key: string]: string }): void =>
    dispatch(
      actions.issueCommentsFormSubmit(
        data[constants.FORM_FIELDS.comment],
        ownProps.formId,
      ),
    ),
  cancelSubmit: (): void => dispatch(actions.issueCommentsFormSubmitCancel()),
  deletePendingAttachments: (): void =>
    dispatch(actions.issueCommentsPendingAttachmentsDelete()),
});

const enhance = compose(
  connect(mapStateToProps, mapDispatchToProps),
  reduxForm({
    enableReinitialize: true,
    destroyOnUnmount: false,
  }),
);

export const IssueCommentsFormContainer = enhance(
  PureIssueCommentsFormContainer,
);
