import { FC, useCallback, useState } from 'react';

import { AlertItem } from 'waldur-ui';

import { AttachmentItem } from '@/form/upload/AttachmentItem';
import { UploadContainer } from '@/form/upload/UploadContainer';
import { translate } from '@/i18n';

import { MAX_CALL_EXPORT_SIZE, parseCallExport } from './callExportYaml';

const CALL_FILE_TYPES = {
  'application/json': ['.json'],
  'text/yaml': ['.yaml', '.yml'],
  'application/yaml': ['.yaml', '.yml'],
  'application/x-yaml': ['.yaml', '.yml'],
};

export interface ParsedCallFile {
  file: File;
  data: Record<string, unknown>;
}

interface CallFileUploadProps {
  value: ParsedCallFile | null;
  onChange(value: ParsedCallFile | null): void;
  /** Shown in the drop zone. */
  message?: string;
  /** Shown when the file is over the size limit. */
  tooLargeMessage?: string;
}

/**
 * Picks a call document file (YAML or JSON, as export_call produces) and
 * parses it, refusing one over the size the backend accepts.
 */
export const CallFileUpload: FC<CallFileUploadProps> = ({
  value,
  onChange,
  message,
  tooLargeMessage,
}) => {
  const [fileError, setFileError] = useState<string | null>(null);

  const onDrop = useCallback(
    async (files: File[]) => {
      const file = files[0];
      if (!file) return;
      try {
        const data = parseCallExport(await file.text());
        onChange({ file, data });
        setFileError(null);
      } catch (error) {
        onChange(null);
        setFileError(error.message);
      }
    },
    [onChange],
  );

  const onDropRejected = useCallback(() => {
    onChange(null);
    setFileError(
      tooLargeMessage ??
        translate(
          'The file is larger than 2 MB, the most a portal accepts. Export the call again without documents and attach them after the import.',
        ),
    );
  }, [onChange, tooLargeMessage]);

  return (
    <>
      {value ? (
        <AttachmentItem
          attachment={{
            file: value.file,
            file_name: value.file.name,
            file_size: value.file.size,
            mime_type: value.file.type,
          }}
          onDelete={() => onChange(null)}
        />
      ) : (
        <UploadContainer
          onDrop={onDrop}
          message={
            message ??
            translate('Call export file (.yaml, .yml or .json, max. 2 MB)')
          }
          onDropRejected={onDropRejected}
          maxSize={MAX_CALL_EXPORT_SIZE}
          accept={CALL_FILE_TYPES}
          multiple={false}
        />
      )}

      {fileError && (
        <AlertItem
          variant="error"
          type="floating"
          className="mt-3"
          title={fileError}
        />
      )}
    </>
  );
};
