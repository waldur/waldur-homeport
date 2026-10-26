import { FunctionComponent } from 'react';

import {
  Avatar,
  TimelineConnector,
  TimelineContent,
  TimelineIcon,
  TimelineItem,
} from 'waldur-ui';

import { ENV } from '@/core/config';
import { formatMediumDateTime, formatRelative } from '@/core/dateUtils';
import { FormattedHtml } from '@/core/FormattedHtml';
import { FormattedJira } from '@/core/FormattedJira';
import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { withLineBreaks } from '@/issues/utils';
import { useModal } from '@/modal/actions';

const UserPopover = lazyComponent(() =>
  import('@/user/UserPopover').then((module) => ({
    default: module.UserPopover,
  })),
);

import { CommentActions } from './CommentActions';
import { Comment } from './types';

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

const AVATAR_COLOR_CLASSES: Record<string, string> = {
  primary: 'bg-brand-subtle text-brand',
  success: 'bg-success-subtle text-success',
  info: 'bg-info-subtle text-info',
  warning: 'bg-warning-subtle text-warning',
  danger: 'bg-danger-subtle text-danger',
};

const CommentAvatar = ({ comment }) => {
  const color = nameToColor(comment.author_name);

  return (
    <TimelineIcon>
      <Avatar
        src={comment.author_image}
        name={comment.author_name}
        size={32}
        fallbackClassName={`text-base font-medium ${AVATAR_COLOR_CLASSES[color] || AVATAR_COLOR_CLASSES.primary}`}
      />
    </TimelineIcon>
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
    <TimelineItem>
      <TimelineConnector />
      <CommentAvatar comment={comment} />
      <TimelineContent className="pb-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 sm:gap-4">
          <div className="min-w-0 flex-1">
            <div className="text-xs text-quaternary">
              <button
                onClick={openUserDialog}
                type="button"
                className="text-btn text-secondary font-medium hover:text-brand text-sm me-3"
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
            <div className="text-sm text-quaternary break-words">
              {ENV.plugins?.WALDUR_SUPPORT?.ACTIVE_BACKEND_TYPE ===
              'atlassian' ? (
                <FormattedJira text={comment.description} />
              ) : (
                <FormattedHtml html={withLineBreaks(comment.description)} />
              )}
            </div>
          </div>
          <CommentActions comment={comment} />
        </div>
      </TimelineContent>
    </TimelineItem>
  );
};
