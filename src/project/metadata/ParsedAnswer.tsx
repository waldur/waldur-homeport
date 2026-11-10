import { PaperclipIcon } from '@phosphor-icons/react';
import { FC, useCallback, useState } from 'react';
import { Answer, QuestionAdmin } from 'waldur-js-client';

import { BaseButton } from 'waldur-ui';

import { ENV } from '@/core/config';
import { lazyComponent } from '@/core/lazyComponent';
import { formatFilesize } from '@/core/utils';
import { downloadFile } from '@/form/upload/FileDownloader';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { useNotify } from '@/store/notify';
import { BooleanField } from '@/table/BooleanField';
import { renderFieldOrDash } from '@/table/utils';

interface ParsedAnswerProps {
  question: QuestionAdmin;
  answer: Answer;
}

export interface FileAttachment {
  name: string;
  size?: number;
  mime_type?: string;
  stored_file_id: string;
}

// The backend names a stored file by its UUID. An answer is written by its
// author, who can put any text in the id, and the id becomes part of a
// download URL fetched with the reader's credentials: only an id shaped like
// a UUID is taken as a stored file. Anything else is shown as text.
const STORED_FILE_ID =
  /^[0-9a-f]{8}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{12}$/i;

// A file that was stored, with an id the media endpoint serves it by. An
// answer missing either cannot be downloaded and is shown as text instead.
export const isFileUpload = (value: unknown): value is FileAttachment => {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const file = value as Record<string, unknown>;
  return (
    typeof file.name === 'string' &&
    typeof file.stored_file_id === 'string' &&
    STORED_FILE_ID.test(file.stored_file_id)
  );
};

// A named file that cannot be downloaded: not yet processed (it still
// carries its content) or stored without an id. Only its name is shown.
const isRawFileUpload = (value: unknown): value is { name: string } =>
  typeof value === 'object' &&
  value !== null &&
  !Array.isArray(value) &&
  typeof (value as Record<string, unknown>).name === 'string' &&
  !isFileUpload(value);

export const downloadMediaFile = (storedFileId: string, fileName: string) =>
  downloadFile(
    `${ENV.apiEndpoint}api/media/${encodeURIComponent(storedFileId)}/`,
    fileName,
  );

export const FileLink: FC<{ file: FileAttachment }> = ({ file }) => {
  const { showErrorResponse } = useNotify();
  const [loading, setLoading] = useState(false);
  const sizeText = file.size ? ` (${formatFilesize(file.size, 'B')})` : '';
  const download = async () => {
    setLoading(true);
    try {
      await downloadMediaFile(file.stored_file_id, file.name);
    } catch (error) {
      showErrorResponse(error, translate('File download failed'));
    } finally {
      setLoading(false);
    }
  };
  return (
    <BaseButton
      variant="text-primary"
      onClick={download}
      pending={loading}
      label={`${file.name}${sizeText}`}
      aria-label={translate('Download {file}', {
        file: `${file.name}${sizeText}`,
      })}
    />
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
    <BaseButton
      variant="text-primary"
      onClick={open}
      iconNode={<PaperclipIcon weight="bold" />}
      label={translate('{count} attachments', { count: files.length })}
    />
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
      <BooleanField value={answerValue} />
    ) : (
      answerValue
    )
  ) : (
    'N/A'
  );
};
