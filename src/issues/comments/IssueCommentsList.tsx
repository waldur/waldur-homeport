import { FunctionComponent } from 'react';

import { TranslateProps, withTranslation } from '@waldur/i18n';

import { IssueCommentItem } from './IssueCommentItem';
import { Comment } from './types';

interface PureIssueCommentsListProps extends TranslateProps {
  comments: Comment[];
  erred?: boolean;
}

export const PureIssueCommentsList: FunctionComponent<PureIssueCommentsListProps> = (
  props,
) => {
  const { comments, erred, translate } = props;

  if (erred) {
    return <div>{translate('Unable to load comments.')}</div>;
  }
  if (!comments.length) {
    return <div>{translate('There are no comments yet.')}</div>;
  }
  return (
    <div className="vertical-container dark-timeline">
      {comments.map((comment) => (
        <IssueCommentItem key={comment.uuid} comment={comment} />
      ))}
    </div>
  );
};

export const IssueCommentsList = withTranslation(PureIssueCommentsList);
