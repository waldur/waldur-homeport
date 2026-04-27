import { Card } from 'react-bootstrap';
import { Issue } from 'waldur-js-client';

import { LoadingSpinner } from '@/core/LoadingSpinner';
import { UploadContainer } from '@/form/upload/UploadContainer';
import { translate } from '@/i18n';
import { RefreshButton } from '@/marketplace/offerings/update/components/RefreshButton';

import { useIssueAttachments, useUploadAttachments } from './api';
import { IssueAttachmentsContext } from './IssueAttachmentsContext';
import { IssueAttachmentsList } from './IssueAttachmentsList';

interface IssueAttachmentsContainerProps {
  issue: Issue;
}

export const IssueAttachmentsContainer: React.FC<
  IssueAttachmentsContainerProps
> = ({ issue }) => {
  const { data, isLoading, refetch } = useIssueAttachments(issue.url);
  const attachments = data ?? [];
  const { uploading, upload, retry, cancel } = useUploadAttachments(issue.url);

  const onDrop = (files: File[]) => {
    upload(files);
  };

  return (
    <IssueAttachmentsContext.Provider value={issue}>
      <Card className="card-bordered issue-attachments">
        <Card.Header>
          <Card.Title>
            <span className="me-2">{translate('Attachments')}</span>
            <RefreshButton refetch={refetch} loading={isLoading} />
          </Card.Title>
        </Card.Header>
        <Card.Body>
          {issue.add_attachment_is_available ? (
            <UploadContainer
              onDrop={onDrop}
              disabled={isLoading}
              message={translate('SVG, PNG, JPG or GIF (max. 800x400px)')}
            />
          ) : null}
          {isLoading && attachments.length === 0 ? (
            <LoadingSpinner />
          ) : (
            <IssueAttachmentsList
              attachments={attachments}
              uploading={uploading}
              onRetry={retry}
              onCancel={cancel}
            />
          )}
        </Card.Body>
      </Card>
    </IssueAttachmentsContext.Provider>
  );
};
