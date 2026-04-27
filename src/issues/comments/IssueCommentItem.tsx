import { FunctionComponent } from 'react';
import { useDispatch } from 'react-redux';

import { ENV } from '@/core/config';
import { formatMediumDateTime, formatRelative } from '@/core/dateUtils';
import { FormattedHtml } from '@/core/FormattedHtml';
import { FormattedJira } from '@/core/FormattedJira';
import { getAbbreviation } from '@/core/utils';
import { translate } from '@/i18n';
import { openUserPopover } from '@/user/actions';

import { CommentActions } from './CommentActions';
import { Comment } from './types';

import './IssueCommentItem.scss';

interface IssueCommentItemProps {
  comment: Comment;
}

const nameToColor = (name: string) => {
  const colors = ['primary', 'success', 'info', 'warning', 'danger'];
  const hash = hashStr(name);
  const index = hash % colors.length;
  return colors[index] || 'primary';
};

const hashStr = (str: string) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const chr = str.charCodeAt(i);
    hash = (hash << 5) - hash + chr;
    hash |= 0;
  }
  return hash;
};

const CommentAvatar = ({ comment }) => {
  const color = nameToColor(comment.author_name);

  return (
    <div className="timeline-icon symbol symbol-circle symbol-32px me-4">
      <div
        className={`symbol-label fs-5 fw-bold bg-light-${color} text-${color}`}
      >
        {getAbbreviation(comment.author_name)}
      </div>
    </div>
  );
};

export const IssueCommentItem: FunctionComponent<IssueCommentItemProps> = ({
  comment,
}) => {
  const dispatch = useDispatch();

  const openUserDialog = () => {
    dispatch(openUserPopover({ user_uuid: comment.author_uuid }));
  };

  return (
    <div className="issue-comment timeline-item">
      <div className="timeline-line w-30px" />
      <CommentAvatar comment={comment} />
      <div className="timeline-content">
        <div className="d-flex justify-content-between gap-5 gap-md-20">
          <div>
            <div className="fs-7 text-muted">
              <button
                onClick={openUserDialog}
                type="button"
                className="text-btn text-gray-700 fw-bold text-hover-primary fs-6 me-3"
              >
                {comment.author_name}
              </button>
              <span title={formatMediumDateTime(comment.created)}>
                {formatRelative(comment.created)}
              </span>
              {!comment.is_public && (
                <span className="text-uppercase">
                  {' - '}
                  {translate('Internal')}
                </span>
              )}
            </div>
            <div className="fs-6 text-muted">
              {ENV.plugins.WALDUR_SUPPORT.ACTIVE_BACKEND_TYPE ===
              'atlassian' ? (
                <FormattedJira text={comment.description} />
              ) : (
                <FormattedHtml html={comment.description} />
              )}
            </div>
          </div>
          <CommentActions comment={comment} />
        </div>
      </div>
    </div>
  );
};
