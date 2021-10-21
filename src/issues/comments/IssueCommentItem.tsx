import DOMPurify from 'dompurify';
import { Fragment, FunctionComponent } from 'react';
import Gravatar from 'react-gravatar';
import { connect } from 'react-redux';
import { compose } from 'redux';

import { formatMediumDateTime } from '@waldur/core/dateUtils';
import { lazyComponent } from '@waldur/core/lazyComponent';
import {
  formatJsxTemplate,
  TranslateProps,
  withTranslation,
} from '@waldur/i18n';
import { getAttachments } from '@waldur/issues/attachments/selectors';
import { Attachment } from '@waldur/issues/attachments/types';
import { openAttachmentModal } from '@waldur/issues/attachments/utils';
import { LoadingOverlay } from '@waldur/issues/comments/LoadingOverlay';
import { openModalDialog } from '@waldur/modal/actions';

import * as actions from './actions';
import './IssueCommentItem.scss';
import { IssueCommentsFormContainer } from './IssueCommentsFormContainer';
import {
  getIsDeleting,
  getIsFormToggleDisabled,
  getIsUiDisabled,
  getUser,
} from './selectors';
import { Comment, User } from './types';
import * as utils from './utils';

const IssueCommentDeleteDialog = lazyComponent(
  () =>
    import(
      /* webpackChunkName: "IssueCommentDeleteDialog" */ './IssueCommentDeleteDialog'
    ),
  'IssueCommentDeleteDialog',
);
interface PureIssueCommentItemProps extends TranslateProps {
  comment: Comment;
  user: User;
  users: any;
  attachments: Attachment[];
  deleting: boolean;
  uiDisabled: boolean;
  formToggleDisabled: boolean;
  openDeleteDialog(): void;
  openUserDialog(): void;
  openAttachmentPreview(url: string, name: string): void;
  toggleForm(): void;
}

const getFilename = (url) => url.slice(url.lastIndexOf('/') + 1);

export const PureIssueCommentItem: FunctionComponent<PureIssueCommentItemProps> = (
  props,
) => {
  const {
    comment,
    attachments,
    user,
    users,
    deleting,
    uiDisabled,
    formToggleDisabled,
    openDeleteDialog,
    openUserDialog,
    openAttachmentPreview,
    toggleForm,
    translate,
  } = props;
  const userList =
    users &&
    users[comment.author_uuid] &&
    users[comment.author_uuid].map((currentUser, index) => (
      <Fragment key={index}>{currentUser.toUpperCase()}</Fragment>
    ));
  const onCommentClick = (evt) => {
    const target = evt.target as HTMLElement;
    if (!target.matches('img')) {
      return;
    }
    const url = target.getAttribute('src');
    openAttachmentPreview(url, getFilename(url));
  };

  return (
    <div className="comment-item vertical-timeline-block">
      {deleting && <LoadingOverlay />}
      <div className="vertical-timeline-icon">
        <Gravatar
          className="b-r-xl img-sm"
          email={comment.author_email || ''}
          size={32}
          default="mm"
        />
      </div>
      <div className="vertical-timeline-content">
        <div className="comment-item__header m-b-sm">
          <div className="comment-item__title">
            {translate(
              '{user} commented:',
              { user: <a onClick={openUserDialog}>{comment.author_name}</a> },
              formatJsxTemplate,
            )}
          </div>
          <div className="comment-item__controls">
            {(user.is_staff || user.uuid === comment.author_uuid) && (
              <>
                <button
                  className="comment-item__edit btn btn-link"
                  disabled={uiDisabled || formToggleDisabled}
                  onClick={toggleForm}
                >
                  <i className="fa fa-edit" aria-hidden="true" />
                </button>
                <button
                  className="comment-item__delete btn btn-link"
                  disabled={uiDisabled}
                  onClick={openDeleteDialog}
                >
                  <i className="fa fa-trash" aria-hidden="true" />
                </button>
              </>
            )}
            {!comment.is_public && (
              <span className="label label-default text-uppercase">
                {translate('Internal')}
              </span>
            )}
          </div>
        </div>
        <div
          className="comment-item__content"
          dangerouslySetInnerHTML={{
            __html: DOMPurify.sanitize(
              utils.formatJiraMarkup(comment.description, attachments),
            ),
          }}
          onClick={onCommentClick}
        />
        <div className="small text-muted m-t-sm">
          <div>{userList}</div>
          <div>{formatMediumDateTime(comment.created)}</div>
        </div>
        <IssueCommentsFormContainer
          formId={comment.uuid}
          defaultMessage={comment.description}
        />
      </div>
    </div>
  );
};

const createDeleteDialog = (uuid) =>
  openModalDialog(IssueCommentDeleteDialog, { resolve: { uuid } });

const mapStateToProps = (state, ownProps) => ({
  attachments: getAttachments(state),
  user: getUser(state),
  deleting: getIsDeleting(state, ownProps),
  uiDisabled: getIsUiDisabled(state),
  formToggleDisabled: getIsFormToggleDisabled(state, ownProps),
});

const mapDispatchToProps = (dispatch, ownProps) => ({
  toggleForm: (): void =>
    dispatch(actions.issueCommentsFormToggle(ownProps.comment.uuid)),
  openDeleteDialog: (): void =>
    dispatch(createDeleteDialog(ownProps.comment.uuid)),
  openUserDialog: (): void =>
    dispatch(utils.openUserModal(ownProps.comment.author_uuid)),
  openAttachmentPreview: (url: string, name: string): void =>
    dispatch(openAttachmentModal(url, name)),
});

const enhance = compose(
  connect(mapStateToProps, mapDispatchToProps),
  withTranslation,
);

export const IssueCommentItem = enhance(PureIssueCommentItem);
