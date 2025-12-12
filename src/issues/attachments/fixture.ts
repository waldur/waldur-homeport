import { IssueAttachmentUploading } from './types';

export const attachmentUploading: IssueAttachmentUploading[] = [
  {
    file: new File([], 'file1.pdf'),
    key: 'file1.pdf',
    progress: 0,
    error: null,
  },
  {
    file: new File([], 'file2.png'),
    key: 'file2.png',
    progress: 0,
    error: null,
  },
];
