import * as React from 'react';

import { TranslateProps, withTranslation } from '@waldur/i18n';

import { IssueCommentItem } from './IssueCommentItem';

import { Comment } from './types';

interface PureIssueCommentsListProps extends TranslateProps {
  comments: Comment[];
  erred?: boolean;
}

export const PureIssueCommentsList = (props: PureIssueCommentsListProps) => {
  const { comments, erred, translate } = props;
  const body = comments.length && comments.map((comment: any) =>
    (
      <IssueCommentItem key={comment.uuid} comment={comment} />
    )
  );

  if (erred) {
    return (<div>{translate('Unable to load comments.')}</div>);
  }
  if (!body.length) {
    return (<div>{translate('There are no comments yet.')}</div>);
  }
  return (<div className="vertical-container dark-timeline">{body}</div>);
};

export const IssueCommentsList = withTranslation(PureIssueCommentsList);
