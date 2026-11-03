import { Attachment as SdkAttachment } from 'waldur-js-client';

// Mastermind sends `can_delete` per attachment, but the published SDK does not
// carry it yet. Optional, so a backend that does not send it reads as unknown.
export type Attachment = SdkAttachment & { can_delete?: boolean };

export type IssueAttachmentUploading = {
  key: string;
  file: File;
  progress: number;
  error?: any;
};
