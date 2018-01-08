import * as React from 'react';

import { IssueAttachment } from './IssueAttachment';
import { IssueAttachmentLoading } from './IssueAttachmentLoading';

import './IssueAttachmentsList.scss';
import { Attachment } from './types';

interface IssueAttachmentsListProps {
  attachments: Attachment[];
  uploading: number;
}

const getAttachmentsLoading = (count: number) => {
  const attachmentsLoadingList = [];

  for (let i = 0; i < count; i++) {
    const blankAttachment = (
      <li key={`attachment-loading-${i}`}>
        <IssueAttachmentLoading />
      </li>
    );
    attachmentsLoadingList.push(blankAttachment);
  }

  return attachmentsLoadingList;
};

export const IssueAttachmentsList = (props: IssueAttachmentsListProps) => {
  const { attachments, uploading } = props;
  const attachmentsList = attachments.length ? attachments.map((attachment: Attachment) =>
    (
      <li key={attachment.uuid}>
        <IssueAttachment attachment={attachment} />
      </li>
    )
  ) : [];
  const attachmentsLoadingList = getAttachmentsLoading(uploading);
  const body = [...attachmentsList, ...attachmentsLoadingList];

  return body.length ? (<ul className="attachment-list">{body}</ul>) : null;
};
