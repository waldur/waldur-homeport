export { Attachment } from 'waldur-js-client';

export type IssueAttachmentUploading = {
  key: string;
  file: File;
  progress: number;
  error?: any;
};
