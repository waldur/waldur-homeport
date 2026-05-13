import { FunctionComponent, useState, useCallback, useEffect } from 'react';
import { Col, Row } from 'react-bootstrap';
import { Field, useForm, useFormState } from 'react-final-form';

import { FormContainerFinal } from '@/form/FormContainerFinal';
import { AttachmentItem } from '@/form/upload/AttachmentItem';
import { UploadContainer } from '@/form/upload/UploadContainer';
import { translate } from '@/i18n';

import { validateOfferingExportFile, ValidationResult } from './fileValidation';
import { OfferingMetadataDisplay } from './OfferingMetadataDisplay';
import { SingleOfferingImportFormData } from './types';

// Define accepted file types for YAML and JSON offerings
const YAML_JSON_FILE_TYPES = {
  'application/json': ['.json'],
  'text/yaml': ['.yaml', '.yml'],
  'application/yaml': ['.yaml', '.yml'],
  'application/x-yaml': ['.yaml', '.yml'],
};

export const FileUploadTab: FunctionComponent = () => {
  const { values: formData } = useFormState<SingleOfferingImportFormData>();
  const form = useForm();

  const [validationResult, setValidationResult] =
    useState<ValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState<boolean>(false);

  const handleFileSelect = useCallback(
    async (file: File) => {
      setIsValidating(true);
      form.change('importFile', file);

      // Validate the file
      try {
        const result = await validateOfferingExportFile(file);
        setValidationResult(result);
        if (result.metadata?.category_name) {
          form.change('_category_name', result.metadata.category_name);
        }
      } catch {
        setValidationResult({
          isValid: false,
          error: translate('Error validating file'),
        });
      } finally {
        setIsValidating(false);
      }
    },
    [form],
  );

  const onDrop = useCallback(
    (files: File[]) => {
      if (files.length > 0) {
        handleFileSelect(files[0]); // Only take the first file
      }
    },
    [handleFileSelect],
  );

  // If there's already a file in formData (e.g., when navigating back), validate it on mount
  useEffect(() => {
    if (formData.importFile) {
      handleFileSelect(formData.importFile);
    }
  }, []);

  const clearFile = useCallback(() => {
    setValidationResult(null);
    form.change('importFile', null);
  }, [form]);

  const validateFileField = useCallback(
    (file: File | null) => {
      if (!file) {
        return translate('Please upload a JSON or YAML offering export file');
      }
      if (validationResult && !validationResult.isValid) {
        return validationResult.error;
      }
      return undefined;
    },
    [validationResult],
  );

  return (
    <FormContainerFinal submitting={false}>
      <Row>
        <Col md={12}>
          <Field
            name="importFile"
            validate={validateFileField}
            render={() => null} // Hidden field
          />

          {!formData.importFile ? (
            <UploadContainer
              onDrop={onDrop}
              disabled={isValidating}
              message={translate(
                'JSON or YAML offering export files (.json, .yaml, .yml - max. 10 MB)',
              )}
              maxSize={10 * 1024 * 1024} // 10MB
              accept={YAML_JSON_FILE_TYPES}
              multiple={false}
            />
          ) : (
            <AttachmentItem
              attachment={{
                file: formData.importFile,
                file_name: formData.importFile.name,
                file_size: formData.importFile.size,
                mime_type: formData.importFile.type,
              }}
              onDelete={clearFile}
              error={validationResult?.error}
            />
          )}

          {isValidating && (
            <div className="d-flex align-items-center justify-content-center p-4">
              <div className="spinner-border text-primary me-2" role="status">
                <span className="visually-hidden">
                  {translate('Loading...')}
                </span>
              </div>
              <span>{translate('Validating file...')}</span>
            </div>
          )}

          {validationResult && !isValidating && (
            <OfferingMetadataDisplay
              metadata={validationResult.metadata}
              isValid={validationResult.isValid}
              error={validationResult.error}
            />
          )}
        </Col>
      </Row>
    </FormContainerFinal>
  );
};
