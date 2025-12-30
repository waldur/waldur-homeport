import { Card } from 'react-bootstrap';
import { Issue } from 'waldur-js-client';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { RefreshButton } from '@waldur/marketplace/offerings/update/components/RefreshButton';

import { useIssueComments } from './api';
import { IssueCommentButton } from './IssueCommentButton';
import { IssueCommentsContext } from './IssueCommentsContext';
import { IssueCommentsList } from './IssueCommentsList';

interface IssueCommentsContainerProps {
  issue: Issue;
}

export const IssueCommentsContainer = ({
  issue,
}: IssueCommentsContainerProps) => {
  const { data, isLoading, refetch } = useIssueComments(issue.url);
  const comments = data ?? [];

  return (
    <IssueCommentsContext.Provider value={issue}>
      <Card className="card-bordered mb-5">
        <Card.Header>
          <Card.Title>
            <span className="me-2">{translate('Comments')}</span>
            <RefreshButton refetch={refetch} loading={isLoading} />
          </Card.Title>
          <div className="card-toolbar">
            <IssueCommentButton />
          </div>
        </Card.Header>
        <Card.Body>
          {isLoading && comments.length === 0 ? (
            <LoadingSpinner />
          ) : (
            <IssueCommentsList comments={comments} />
          )}
        </Card.Body>
      </Card>
    </IssueCommentsContext.Provider>
  );
};
