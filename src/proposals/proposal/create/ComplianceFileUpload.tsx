import { FileIcon, TrashIcon } from '@phosphor-icons/react';
import { FC, useCallback, useMemo, useState } from 'react';
import { Button } from 'react-bootstrap';
import { FieldInputProps, FieldMetaState } from 'react-final-form';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { UploadContainer } from '@waldur/form/upload/UploadContainer';
import { translate } from '@waldur/i18n';

import '@waldur/form/upload/AttachmentsList.scss';

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

interface ComplianceFileUploadProps {
  input: FieldInputProps<FileAnswerData | FileAnswerData[] | null>;
  meta: FieldMetaState<any>;
  question: {
    uuid: string;
    question_type: string;
    allowed_file_types?: string[];
    allowed_mime_types?: string[];
    max_file_size_mb?: number;
    max_files_count?: number;
  };
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
  maxSizeMb?: number,
  maxCount?: number,
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

export const ComplianceFileUpload: FC<ComplianceFileUploadProps> = ({
  input,
  question,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const isMultiple = question.question_type === 'multiple_files';

  const currentFiles = useMemo(
    () => getCurrentFiles(input.value),
    [input.value],
  );

  const acceptConfig = useMemo(
    () =>
      buildAcceptConfig(
        question.allowed_file_types,
        question.allowed_mime_types,
      ),
    [question.allowed_file_types, question.allowed_mime_types],
  );

  const uploadMessage = useMemo(
    () =>
      buildUploadMessage(
        question.allowed_file_types,
        question.max_file_size_mb,
        question.max_files_count,
        isMultiple,
      ),
    [
      question.allowed_file_types,
      question.max_file_size_mb,
      question.max_files_count,
      isMultiple,
    ],
  );

  const maxSizeBytes = question.max_file_size_mb
    ? question.max_file_size_mb * 1024 * 1024
    : undefined;

  const handleDrop = useCallback(
    async (newFiles: File[]) => {
      if (newFiles.length === 0) return;

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
          const limited = question.max_files_count
            ? combined.slice(0, question.max_files_count)
            : combined;
          input.onChange(limited);
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
        message={uploadMessage}
        multiple={isMultiple}
        maxSize={maxSizeBytes}
        accept={acceptConfig}
        disabled={isProcessing}
      />

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
                  <Button
                    variant="flush"
                    size="sm"
                    className="btn-icon-gray-400 btn-active-icon-danger attachment-item__delete btn-icon-right"
                    onClick={() => handleRemove(file.name)}
                  >
                    <span className="svg-icon svg-icon-2">
                      <TrashIcon weight="bold" />
                    </span>
                  </Button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
};
