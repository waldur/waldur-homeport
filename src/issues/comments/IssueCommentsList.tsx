import { FunctionComponent } from 'react';

import { translate } from '@waldur/i18n';

import { IssueCommentItem } from './IssueCommentItem';
import { Comment } from './types';

interface PureIssueCommentsListProps {
  comments: Comment[];
  erred?: boolean;
}

export const IssueCommentsList: FunctionComponent<PureIssueCommentsListProps> =
  (props) => {
    const { comments, erred } = props;

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
