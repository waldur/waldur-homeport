import { FC, useCallback } from 'react';
import { FileRejection } from 'react-dropzone';

import { FormField, FormLabel, FormText, Textarea } from 'waldur-ui';

import { AttachmentItem } from '@/form/upload/AttachmentItem';
import { UploadContainer } from '@/form/upload/UploadContainer';
import { translate } from '@/i18n';

import { getTooLongMessage, MAX_CONFIGURATION_LENGTH } from './importModel';

const YAML_FILE_TYPES = {
  'text/yaml': ['.yaml', '.yml'],
  'application/yaml': ['.yaml', '.yml'],
  'application/x-yaml': ['.yaml', '.yml'],
};

// What the server takes; an agent configuration file is a few kilobytes.
const MAX_FILE_SIZE = MAX_CONFIGURATION_LENGTH;

interface FileStepProps {
  configuration: string;
  file: File | null;
  errors: string[];
  disabled: boolean;
  onConfigurationChange(configuration: string): void;
  onFileChange(file: File | null, configuration: string): void;
  onErrors(errors: string[]): void;
}

export const FileStep: FC<FileStepProps> = ({
  configuration,
  file,
  errors,
  disabled,
  onConfigurationChange,
  onFileChange,
  onErrors,
}) => {
  const onDrop = useCallback(
    async (files: File[]) => {
      const [selected] = files;
      if (!selected) {
        return;
      }
      try {
        onFileChange(selected, await selected.text());
      } catch {
        onErrors([translate('Unable to read the file.')]);
      }
    },
    [onFileChange, onErrors],
  );

  const onDropRejected = useCallback(
    (rejections: FileRejection[]) =>
      onErrors(
        rejections.flatMap(({ errors: fileErrors }) =>
          fileErrors.map((error) =>
            error.code === 'file-too-large'
              ? getTooLongMessage()
              : translate('Choose a YAML file (.yaml or .yml).'),
          ),
        ),
      ),
    [onErrors],
  );

  return (
    <>
      <p className="text-secondary mb-4">
        {translate(
          "Import the site agent's configuration file, as it runs on the agent host, into this offering's agent configuration. Nothing is saved until you review the changes and import them.",
        )}
      </p>
      {file ? (
        <AttachmentItem
          attachment={{
            file,
            file_name: file.name,
            file_size: file.size,
            mime_type: file.type,
          }}
          onDelete={() => onFileChange(null, '')}
        />
      ) : (
        <UploadContainer
          onDrop={onDrop}
          onDropRejected={onDropRejected}
          disabled={disabled}
          accept={YAML_FILE_TYPES}
          maxSize={MAX_FILE_SIZE}
          multiple={false}
          inputLabel={translate('Upload agent configuration file')}
          message={translate(
            'Agent configuration file (.yaml, .yml - max. 512 KiB)',
          )}
        />
      )}
      <FormField className="mt-5">
        <FormLabel>{translate('Or paste the configuration')}</FormLabel>
        <Textarea
          rows={14}
          value={configuration}
          onChange={(event) => onConfigurationChange(event.target.value)}
          disabled={disabled}
          invalid={errors.length > 0}
          spellCheck={false}
          className="font-mono"
          placeholder={
            'offerings:\n  - name: ...\n    waldur_offering_uuid: ...'
          }
        />
        {errors.map((error) => (
          <FormText key={error} variant="danger">
            {error}
          </FormText>
        ))}
        <FormText variant="muted">
          {translate(
            'Secrets in the file are not imported: they stay in the configuration file on the agent host.',
          )}
        </FormText>
      </FormField>
    </>
  );
};
