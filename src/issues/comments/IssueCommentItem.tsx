import DOMPurify from 'dompurify';
import { FunctionComponent } from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';

import { formatMediumDateTime } from '@waldur/core/dateUtils';
import { lazyComponent } from '@waldur/core/lazyComponent';
import { getAbbreviation } from '@waldur/core/utils';
import { translate } from '@waldur/i18n';
import { getAttachments } from '@waldur/issues/attachments/selectors';
import { Attachment } from '@waldur/issues/attachments/types';
import { openAttachmentModal } from '@waldur/issues/attachments/utils';
import { LoadingOverlay } from '@waldur/issues/comments/LoadingOverlay';
import { openModalDialog } from '@waldur/modal/actions';
import { UserDetails } from '@waldur/workspace/types';

import * as actions from './actions';
import { IssueCommentsFormContainer } from './IssueCommentsFormContainer';
import {
  getIsDeleting,
  getIsFormToggleDisabled,
  getIsUiDisabled,
  getUser,
} from './selectors';
import { Comment } from './types';
import * as utils from './utils';

const IssueCommentDeleteDialog = lazyComponent(
  () => import('./IssueCommentDeleteDialog'),
  'IssueCommentDeleteDialog',
);
interface PureIssueCommentItemProps {
  comment: Comment;
  user: UserDetails;
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

const nameToColor = (name) => {
  const colors = ['primary', 'success', 'info', 'warning', 'danger'];
  const hash = hashStr(name);
  const index = hash % colors.length;
  return colors[index] || 'primary';
};

const hashStr = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const chr = str.charCodeAt(i);
    hash = (hash << 5) - hash + chr;
    hash |= 0;
  }
  return hash;
};

export const PureIssueCommentItem: FunctionComponent<PureIssueCommentItemProps> =
  (props) => {
    const {
      comment,
      attachments,
      user,
      deleting,
      uiDisabled,
      formToggleDisabled,
      openDeleteDialog,
      openUserDialog,
      openAttachmentPreview,
      toggleForm,
    } = props;
    const onCommentClick = (evt) => {
      const target = evt.target as HTMLElement;
      if (!target.matches('img')) {
        return;
      }
      const url = target.getAttribute('src');
      openAttachmentPreview(url, getFilename(url));
    };

    const color = nameToColor(comment.author_name);

    return deleting ? (
      <LoadingOverlay />
    ) : (
      <div className="card card-bordered mb-9">
        <div className="card-body">
          <div className="w-100 d-flex flex-stack mb-8">
            <div className="d-flex align-items-center f">
              <div className="symbol symbol-50px me-5">
                <div
                  className={`symbol-label fs-1 fw-bold bg-light-${color} text-${color}`}
                >
                  {getAbbreviation(comment.author_name)}
                </div>
              </div>
              <div className="d-flex flex-column fw-semibold fs-5 text-gray-600 text-dark">
                <div className="d-flex align-items-center">
                  <a
                    onClick={openUserDialog}
                    className="text-gray-800 fw-bold text-hover-primary fs-5 me-3"
                  >
                    {comment.author_name}
                  </a>
                  <span className="m-0"></span>
                </div>
                <span className="text-muted fw-semibold fs-6">
                  {formatMediumDateTime(comment.created)}
                </span>
                {!comment.is_public && (
                  <span className="label label-default text-uppercase">
                    {translate('Internal')}
                  </span>
                )}
              </div>
            </div>
            <div className="m-0">
              {(user.is_staff || user.uuid === comment.author_uuid) && (
                <>
                  <button
                    className="btn btn-color-gray-400 btn-active-color-primary p-0 fw-bold me-3"
                    disabled={
                      uiDisabled ||
                      formToggleDisabled ||
                      !comment.update_is_available
                    }
                    onClick={toggleForm}
                  >
                    {translate('Edit')}
                  </button>
                  <button
                    className="btn btn-color-gray-400 btn-active-color-primary p-0 fw-bold"
                    disabled={uiDisabled || !comment.destroy_is_available}
                    onClick={openDeleteDialog}
                  >
                    {translate('Delete')}
                  </button>
                </>
              )}
            </div>
          </div>
          <p
            className="fw-normal fs-5 text-gray-700 m-0"
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(
                utils.formatJiraMarkup(comment.description, attachments),
              ),
            }}
            onClick={onCommentClick}
          />
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

const enhance = compose(connect(mapStateToProps, mapDispatchToProps));

export const IssueCommentItem = enhance(PureIssueCommentItem);
