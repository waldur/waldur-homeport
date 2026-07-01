import { FunctionComponent } from 'react';

import Avatar from '@/core/Avatar';
import { ENV } from '@/core/config';
import { formatMediumDateTime, formatRelative } from '@/core/dateUtils';
import { FormattedHtml } from '@/core/FormattedHtml';
import { FormattedJira } from '@/core/FormattedJira';
import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';

const UserPopover = lazyComponent(() =>
  import('@/user/UserPopover').then((module) => ({
    default: module.UserPopover,
  })),
);

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
    <div className="timeline-icon me-4">
      <Avatar
        src={comment.author_image}
        name={comment.author_name}
        size={32}
        circle
        labelClassName={`fs-5 fw-bold bg-light-${color} text-${color}`}
      />
    </div>
  );
};

export const IssueCommentItem: FunctionComponent<IssueCommentItemProps> = ({
  comment,
}) => {
  const { openDialog } = useModal();

  const openUserDialog = () => {
    openDialog(UserPopover, {
      resolve: { user_uuid: comment.author_uuid },
      size: 'lg',
    });
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
