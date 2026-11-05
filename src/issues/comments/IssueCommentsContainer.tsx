import { useQuery } from '@tanstack/react-query';
import { FC } from 'react';
import { Issue, supportCommentsList } from 'waldur-js-client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardToolbar,
} from 'waldur-ui';

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
      <Card bordered className="mb-4">
        <CardHeader>
          <CardTitle as="div">
            <span className="me-1.5">{translate('Comments')}</span>
            <RefreshButton refetch={refetch} loading={isLoading} />
          </CardTitle>
          <CardToolbar>
            <IssueCommentButton />
          </CardToolbar>
        </CardHeader>
        <CardContent>
          {isLoading && comments.length === 0 ? (
            <LoadingSpinner />
          ) : (
            <IssueCommentsList comments={comments} />
          )}
        </CardContent>
      </Card>
    </IssueCommentsContext.Provider>
  );
};
