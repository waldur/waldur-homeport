import { FC, useCallback, useRef, useState } from 'react';

import FormTable from '@waldur/form/FormTable';
import { translate } from '@waldur/i18n';
import { SecretField as PlainSecretField } from '@waldur/marketplace/common/SecretField';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { DASH_ESCAPE_CODE } from '@waldur/table/constants';

import { KEYCLOAK_FIELDS } from './constants';

interface KeycloakExportData {
  type: string;
  version: number;
  exported_at: string;
  offering_name: string;
  secret_options: Record<string, unknown>;
  plugin_options: Record<string, unknown>;
}

interface ImportKeycloakSettingsDialogProps {
  resolve: {
    update: (formData: {
      secret_options?: Record<string, unknown>;
      plugin_options?: Record<string, unknown>;
    }) => Promise<void>;
  };
}

/** Returns an error message, or null if valid. */
const validateExportData = (data: unknown): string | null => {
  if (!data || typeof data !== 'object') {
    return translate('Invalid JSON structure.');
  }
  const obj = data as Record<string, unknown>;
  if (obj.type !== 'waldur-keycloak-integration') {
    return translate(
      'Not a Keycloak integration export file (wrong type field).',
    );
  }
  if (!obj.secret_options && !obj.plugin_options) {
    return translate(
      'File contains no settings (missing secret_options and plugin_options).',
    );
  }
  return null;
};

export const ImportKeycloakSettingsDialog: FC<
  ImportKeycloakSettingsDialogProps
> = ({ resolve }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [parsedData, setParsedData] = useState<KeycloakExportData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [applying, setApplying] = useState(false);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setError(null);
      setParsedData(null);

      const reader = new FileReader();
      reader.onload = () => {
        try {
          const json = JSON.parse(reader.result as string);
          const validationError = validateExportData(json);
          if (validationError) {
            setError(validationError);
          } else {
            setParsedData(json as KeycloakExportData);
          }
        } catch {
          setError(translate('File is not valid JSON.'));
        }
      };
      reader.readAsText(file);
      // Reset input so the same file can be re-selected
      e.target.value = '';
    },
    [],
  );

  const handleApply = useCallback(async () => {
    if (!parsedData) return;
    setApplying(true);
    try {
      const payload: {
        secret_options?: Record<string, unknown>;
        plugin_options?: Record<string, unknown>;
      } = {};
      if (parsedData.secret_options) {
        payload.secret_options = parsedData.secret_options;
      }
      if (parsedData.plugin_options) {
        payload.plugin_options = parsedData.plugin_options;
      }
      await resolve.update(payload);
    } catch {
      // update() handles error toast internally
    } finally {
      setApplying(false);
    }
  }, [parsedData, resolve]);

  const getPreviewValue = (fieldKey: string) => {
    // fieldKey is e.g. "secret_options.keycloak_url"
    const [section, key] = fieldKey.split('.');
    if (!parsedData) return undefined;
    const sectionData = parsedData[section] as Record<string, unknown>;
    return sectionData?.[key];
  };

  return (
    <ModalDialog
      title={translate('Import Keycloak settings')}
      subtitle={
        parsedData?.offering_name
          ? translate('Exported from: {name}', {
              name: parsedData.offering_name,
            })
          : undefined
      }
      footer={
        <>
          <CloseDialogButton className="w-175px" />
          {parsedData && (
            <button
              type="button"
              className="btn btn-primary w-175px"
              onClick={handleApply}
              disabled={applying}
            >
              {applying && (
                <span className="spinner-border spinner-border-sm me-2" />
              )}
              {translate('Apply')}
            </button>
          )}
        </>
      }
    >
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        className="d-none"
        onChange={handleFileChange}
      />

      {!parsedData && !error && (
        <div className="text-center py-10">
          <button
            type="button"
            className="btn btn-light-primary"
            onClick={() => fileInputRef.current?.click()}
          >
            <i className="fa fa-upload me-2" />
            {translate('Select JSON file')}
          </button>
          <p className="text-muted mt-3 mb-0">
            {translate(
              'Choose a previously exported Keycloak integration settings file.',
            )}
          </p>
        </div>
      )}

      {error && (
        <div className="text-center py-10">
          <div className="alert alert-danger mb-4">{error}</div>
          <button
            type="button"
            className="btn btn-light-primary"
            onClick={() => fileInputRef.current?.click()}
          >
            <i className="fa fa-upload me-2" />
            {translate('Try another file')}
          </button>
        </div>
      )}

      {parsedData && (
        <>
          <div className="d-flex justify-content-end mb-3">
            <button
              type="button"
              className="btn btn-sm btn-light"
              onClick={() => fileInputRef.current?.click()}
            >
              <i className="fa fa-upload me-2" />
              {translate('Choose different file')}
            </button>
          </div>
          <FormTable>
            {KEYCLOAK_FIELDS.map((field) => {
              const value = getPreviewValue(field.key);
              return (
                <FormTable.Item
                  key={field.key}
                  label={field.label}
                  value={
                    field.isSecret ? (
                      value ? (
                        <PlainSecretField value={String(value)} />
                      ) : (
                        DASH_ESCAPE_CODE
                      )
                    ) : field.isCheckbox ? (
                      value ? (
                        <i className="fa fa-check text-success" />
                      ) : (
                        <i className="fa fa-times text-danger" />
                      )
                    ) : value !== undefined &&
                      value !== null &&
                      value !== '' ? (
                      String(value)
                    ) : (
                      DASH_ESCAPE_CODE
                    )
                  }
                />
              );
            })}
          </FormTable>
        </>
      )}
    </ModalDialog>
  );
};
