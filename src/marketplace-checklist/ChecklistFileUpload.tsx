import { FileIcon, TrashIcon } from '@phosphor-icons/react';
import { FC, useCallback, useMemo, useState } from 'react';
import { FileRejection } from 'react-dropzone';
import { FieldInputProps, FieldMetaState } from 'react-final-form';

import { LoadingSpinner } from '@/core/LoadingSpinner';
import { UploadContainer } from '@/form/upload/UploadContainer';
import { translate } from '@/i18n';
import { CompactActionButton } from '@/table/CompactActionButton';

import '@/form/upload/AttachmentsList.scss';

// Format for new file uploads (before backend processing)
interface FileUploadData {
  name: string;
  content: string; // base64 encoded
}

// Format for existing file answers (after backend processing)
interface ProcessedFileData {
  name: string;
  stored_file_id: string;
  mime_type?: string;
  size?: number;
}

// Combined type for form value
type FileAnswerData = FileUploadData | ProcessedFileData;

interface ChecklistFileUploadProps {
  input: FieldInputProps<FileAnswerData | FileAnswerData[] | null>;
  meta?: FieldMetaState<any>;
  // Field types are typed as `unknown` on the generated SDK models, so accept
  // them loosely here and cast to concrete types where used.
  question: {
    question_type?: string;
    allowed_file_types?: unknown;
    allowed_mime_types?: unknown;
    max_file_size_mb?: number | null;
    max_files_count?: number | null;
  };
  /** Called with true when a file is rejected, false when accepted or error cleared. */
  onRejectionChange?: (hasError: boolean) => void;
}

/**
 * Convert a File to base64 encoded string
 */
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Remove the data URL prefix (e.g., "data:application/pdf;base64,")
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

/**
 * Convert file extensions to MIME type accept format for react-dropzone
 */
const buildAcceptConfig = (
  fileTypes?: string[],
  mimeTypes?: string[],
): Record<string, string[]> | undefined => {
  if (!fileTypes?.length && !mimeTypes?.length) {
    return undefined; // Accept all files
  }

  const accept: Record<string, string[]> = {};

  if (mimeTypes?.length) {
    mimeTypes.forEach((mimeType) => {
      accept[mimeType] = fileTypes?.length ? fileTypes : [];
    });
  } else if (fileTypes?.length) {
    const extensionToMime: Record<string, string> = {
      '.pdf': 'application/pdf',
      '.doc': 'application/msword',
      '.docx':
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      '.xls': 'application/vnd.ms-excel',
      '.xlsx':
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.gif': 'image/gif',
      '.txt': 'text/plain',
      '.csv': 'text/csv',
      '.odt': 'application/vnd.oasis.opendocument.text',
    };

    fileTypes.forEach((ext) => {
      const mimeType = extensionToMime[ext.toLowerCase()];
      if (mimeType) {
        if (!accept[mimeType]) {
          accept[mimeType] = [];
        }
        accept[mimeType].push(ext);
      } else {
        if (!accept['application/octet-stream']) {
          accept['application/octet-stream'] = [];
        }
        accept['application/octet-stream'].push(ext);
      }
    });
  }

  return Object.keys(accept).length > 0 ? accept : undefined;
};

/**
 * Build a human-readable message for accepted file types and size limits
 */
const buildUploadMessage = (
  fileTypes?: string[],
  maxSizeMb?: number | null,
  maxCount?: number | null,
  isMultiple?: boolean,
): string => {
  const parts: string[] = [];

  if (fileTypes?.length) {
    const formatted = fileTypes
      .map((ext) => ext.replace('.', '').toUpperCase())
      .join(', ');
    parts.push(formatted);
  }

  if (maxSizeMb) {
    parts.push(translate('max. {size} MB', { size: maxSizeMb }));
  }

  if (isMultiple && maxCount) {
    parts.push(translate('max. {count} files', { count: maxCount }));
  }

  return parts.length > 0
    ? `(${parts.join(', ')})`
    : translate('All file types accepted');
};

/**
 * Check if a value is a valid file answer (either new upload or processed)
 */
const isFileAnswer = (value: unknown): value is FileAnswerData => {
  if (!value || typeof value !== 'object') return false;
  const obj = value as Record<string, unknown>;
  // Check for new upload format (has content) or processed format (has stored_file_id)
  return (
    typeof obj.name === 'string' &&
    (typeof obj.content === 'string' || typeof obj.stored_file_id === 'string')
  );
};

/**
 * Get current files from form value (handles both single and multiple file formats)
 */
const getCurrentFiles = (
  value: FileAnswerData | FileAnswerData[] | null,
): FileAnswerData[] => {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter(isFileAnswer);
  // Single file stored as object
  if (isFileAnswer(value)) {
    return [value];
  }
  return [];
};

export const ChecklistFileUpload: FC<ChecklistFileUploadProps> = ({
  input,
  question,
  onRejectionChange,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [rejectionError, setRejectionError] = useState<string | null>(null);
  const isMultiple = question.question_type === 'multiple_files';
  const allowedFileTypes = question.allowed_file_types as string[] | undefined;
  const allowedMimeTypes = question.allowed_mime_types as string[] | undefined;

  const currentFiles = useMemo(
    () => getCurrentFiles(input.value),
    [input.value],
  );

  const acceptConfig = useMemo(
    () => buildAcceptConfig(allowedFileTypes, allowedMimeTypes),
    [allowedFileTypes, allowedMimeTypes],
  );

  const uploadMessage = useMemo(
    () =>
      buildUploadMessage(
        allowedFileTypes,
        question.max_file_size_mb,
        question.max_files_count,
        isMultiple,
      ),
    [
      allowedFileTypes,
      question.max_file_size_mb,
      question.max_files_count,
      isMultiple,
    ],
  );

  const maxSizeBytes = question.max_file_size_mb
    ? question.max_file_size_mb * 1024 * 1024
    : undefined;

  const handleDropRejected = useCallback(
    (rejections: FileRejection[]) => {
      const hasFileTooLarge = rejections.some((r) =>
        r.errors.some((e) => e.code === 'file-too-large'),
      );
      const hasInvalidType = rejections.some((r) =>
        r.errors.some((e) => e.code === 'file-invalid-type'),
      );
      let errorMsg: string;
      if (hasFileTooLarge && question.max_file_size_mb) {
        errorMsg = translate(
          'File is too large. Maximum allowed size is {size} MB.',
          { size: question.max_file_size_mb },
        );
      } else if (hasInvalidType) {
        errorMsg = translate('File type is not allowed.');
      } else {
        errorMsg = translate('File could not be uploaded.');
      }
      setRejectionError(errorMsg);
      onRejectionChange?.(true);
    },
    [question.max_file_size_mb, onRejectionChange],
  );

  const handleDrop = useCallback(
    async (newFiles: File[]) => {
      if (newFiles.length === 0) return;
      setRejectionError(null);
      onRejectionChange?.(false);

      setIsProcessing(true);
      try {
        // Convert all new files to base64
        const convertedFiles: FileAnswerData[] = await Promise.all(
          newFiles.map(async (file) => ({
            name: file.name,
            content: await fileToBase64(file),
          })),
        );

        if (isMultiple) {
          // For multiple files, append to existing
          const combined = [...currentFiles, ...convertedFiles];
          // Respect max files count if set
          if (
            question.max_files_count &&
            combined.length > question.max_files_count
          ) {
            setRejectionError(
              translate('Maximum number of files is {count}.', {
                count: question.max_files_count,
              }),
            );
            onRejectionChange?.(true);
            return;
          }
          input.onChange(combined);
        } else {
          // For single file, store as single object (not array)
          input.onChange(convertedFiles[0]);
        }
      } finally {
        setIsProcessing(false);
      }
    },
    [currentFiles, isMultiple, question.max_files_count, input],
  );

  const handleRemove = useCallback(
    (fileName: string) => {
      const filtered = currentFiles.filter((file) => file.name !== fileName);
      if (isMultiple) {
        input.onChange(filtered.length > 0 ? filtered : null);
      } else {
        input.onChange(null);
      }
    },
    [currentFiles, isMultiple, input],
  );

  return (
    <>
      <UploadContainer
        onDrop={handleDrop}
        onDropRejected={handleDropRejected}
        message={uploadMessage}
        multiple={isMultiple}
        maxSize={maxSizeBytes}
        accept={acceptConfig}
        disabled={isProcessing}
      />
      {rejectionError && (
        <div className="text-danger fs-7 mt-1">{rejectionError}</div>
      )}

      {isProcessing && (
        <div className="d-flex align-items-center gap-2 mt-2 text-muted">
          <LoadingSpinner />
          <span>{translate('Processing files...')}</span>
        </div>
      )}

      {currentFiles.length > 0 && (
        <ul className="attachment-list">
          {currentFiles.map((file, index) => (
            <li key={`${file.name}-${index}`}>
              <div className="attachment-item">
                <div className="attachment-item__thumb">
                  <FileIcon size={22} weight="bold" />
                </div>
                <div className="attachment-item__body">
                  <h6 className="fw-bold text-secondary">{file.name}</h6>
                  <p className="fs-6 text-muted">
                    {'stored_file_id' in file
                      ? translate('Uploaded')
                      : translate('Pending upload')}
                  </p>
                </div>
                <div>
                  <CompactActionButton
                    action={() => handleRemove(file.name)}
                    iconNode={<TrashIcon weight="bold" />}
                    variant="flush"
                    className="btn-icon-gray-400 btn-active-icon-danger attachment-item__delete"
                  />
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
};
