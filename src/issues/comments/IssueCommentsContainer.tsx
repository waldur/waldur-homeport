import { useQuery } from '@tanstack/react-query';
import { FC } from 'react';
import { Issue, supportCommentsList } from 'waldur-js-client';

import { LoadingSpinner } from '@/core/LoadingSpinner';
import { translate } from '@/i18n';
import { RefreshButton } from '@/marketplace/offerings/update/components/RefreshButton';

import { ISSUE_COMMENTS_QUERY_KEY } from './constants';
import { IssueCommentButton } from './IssueCommentButton';
import { IssueCommentsContext } from './IssueCommentsContext';
import { IssueCommentsList } from './IssueCommentsList';
import { Comment } from './types';

interface IssueCommentsContainerProps {
  issue: Issue;
}

const sortComments = (comments: Comment[]) =>
  [...comments].sort((a, b) => Date.parse(b.created) - Date.parse(a.created));

export const IssueCommentsContainer: FC<IssueCommentsContainerProps> = ({
  issue,
}) => {
  const { data, isLoading, refetch } = useQuery({
    queryKey: [ISSUE_COMMENTS_QUERY_KEY, issue.url],
    queryFn: async () => {
      const response = await supportCommentsList({
        query: { issue: issue.url },
      });
      return sortComments(response.data);
    },
    enabled: !!issue.url,
  });
  const comments = data ?? [];

  return (
    <IssueCommentsContext.Provider value={issue}>
      <div className="card card-bordered mb-4">
        <div className="card-header">
          <div className="card-title">
            <span className="me-1.5">{translate('Comments')}</span>
            <RefreshButton refetch={refetch} loading={isLoading} />
          </div>
          <div className="card-toolbar">
            <IssueCommentButton />
          </div>
        </div>
        <div className="card-body">
          {isLoading && comments.length === 0 ? (
            <LoadingSpinner />
          ) : (
            <IssueCommentsList comments={comments} />
          )}
        </div>
      </div>
    </IssueCommentsContext.Provider>
  );
};
