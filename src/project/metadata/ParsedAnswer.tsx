import { PaperclipIcon } from '@phosphor-icons/react';
import { FC, useCallback } from 'react';
import { Answer, QuestionAdmin } from 'waldur-js-client';

import { BooleanBadge } from '@/core/BooleanBadge';
import { ENV } from '@/core/config';
import { lazyComponent } from '@/core/lazyComponent';
import { formatFilesize } from '@/core/utils';
import { downloadFile } from '@/form/upload/FileDownloader';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { renderFieldOrDash } from '@/table/utils';

interface ParsedAnswerProps {
  question: QuestionAdmin;
  answer: Answer;
}

interface FileAttachment {
  name: string;
  size?: number;
  mime_type?: string;
  stored_file_id: string;
}

// Check if the answer is a processed file upload object (has stored_file_id)
const isFileUpload = (value: unknown): value is FileAttachment => {
  return (
    typeof value === 'object' &&
    value !== null &&
    'stored_file_id' in value &&
    'name' in value
  );
};

// Check if the answer is a raw (unprocessed) file upload object (has content)
const isRawFileUpload = (
  value: unknown,
): value is { name: string; content: string } => {
  return (
    typeof value === 'object' &&
    value !== null &&
    'content' in value &&
    'name' in value &&
    !('stored_file_id' in value)
  );
};

const downloadMediaFile = (storedFileId: string, fileName: string) => {
  const url = `${ENV.apiEndpoint}api/media/${storedFileId}/`;
  downloadFile(url, fileName);
};

const FileLink: FC<{ file: FileAttachment }> = ({ file }) => {
  const sizeText = file.size ? ` (${formatFilesize(file.size, 'B')})` : '';
  return (
    <button
      type="button"
      className="btn btn-link p-0 text-primary"
      onClick={() => downloadMediaFile(file.stored_file_id, file.name)}
    >
      {file.name}
      {sizeText}
    </button>
  );
};

const FileAttachmentsDialog = lazyComponent(() =>
  import('./FileAttachmentsDialog').then((module) => ({
    default: module.FileAttachmentsDialog,
  })),
);

const MultipleFilesAnswer: FC<{
  files: FileAttachment[];
}> = ({ files }) => {
  const { openDialog } = useModal();
  const open = useCallback(() => {
    openDialog(FileAttachmentsDialog, {
      resolve: { files },
    });
  }, [files, openDialog]);

  return (
    <button
      type="button"
      className="btn btn-link p-0 text-primary d-inline-flex align-items-center gap-1"
      onClick={open}
    >
      <PaperclipIcon weight="bold" />
      {translate('{count} attachments', { count: files.length })}
    </button>
  );
};

export const ParsedAnswer: FC<ParsedAnswerProps> = ({ question, answer }) => {
  let answerValue = answer?.answer_data as any;

  if (
    ['single_select', 'multi_select'].includes(question.question_type) &&
    Array.isArray(answerValue) &&
    question.question_options?.length
  ) {
    answerValue = question.question_options
      .filter((opt) => answerValue.includes(opt.uuid))
      .map((opt) => opt.label);
  }

  // Handle raw (unprocessed) file — show name only, no link
  if (isRawFileUpload(answerValue)) {
    return <>{answerValue.name}</>;
  }
  if (
    Array.isArray(answerValue) &&
    answerValue.length > 0 &&
    answerValue.every(isRawFileUpload)
  ) {
    return <>{answerValue.map((f) => f.name).join(', ')}</>;
  }

  // Handle single file upload answer
  if (isFileUpload(answerValue)) {
    return <FileLink file={answerValue} />;
  }

  // Handle multiple files upload answer
  if (
    Array.isArray(answerValue) &&
    answerValue.length > 0 &&
    answerValue.every(isFileUpload)
  ) {
    // Single file in a multiple_files field — render same as a regular file link
    if (answerValue.length === 1) {
      return <FileLink file={answerValue[0]} />;
    }
    return <MultipleFilesAnswer files={answerValue} />;
  }

  return answerValue || [0, false].includes(answerValue) ? (
    Array.isArray(answerValue) ? (
      renderFieldOrDash(answerValue.join(', '))
    ) : answerValue === true || answerValue === false ? (
      <BooleanBadge value={answerValue} />
    ) : (
      answerValue
    )
  ) : (
    'N/A'
  );
};
