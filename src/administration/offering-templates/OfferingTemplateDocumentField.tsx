import { FC, useMemo } from 'react';
import { useField, useFormState } from 'react-final-form';

import { TextGroup } from '@/form';
import { translate } from '@/i18n';

import { OfferingTemplateParametersTable } from './OfferingTemplateParametersTable';
import {
  DOCUMENT_ERRORS,
  DocumentError,
  documentParameters,
  validateDocumentText,
} from './templateDocument';

// A document the API takes as it is: each parameter's target path is left
// empty in the document, since the parameter fills it.
const PLACEHOLDER = `schema_version: 1
offering:
  name: SLURM cluster
components:
  - type: cpu
    name: CPU hours
    measured_unit: hours
    billing_type: usage
plans:
  - name: Default
agent_configuration: {}
parameters:
  - key: cluster_name
    label: Cluster name
    type: string
    required: true
    paths: [offering.backend_id]`;

/**
 * The parameters the document declares, read from the editor as it is typed,
 * with the API's errors for each one beside it. Parameters live in the
 * document, so this is where they are edited: the table only reads them.
 */
const DocumentParameters: FC = () => {
  const {
    input: { value },
    meta: { dirtySinceLastSubmit },
  } = useField<string>('document', {
    subscription: { value: true, dirtySinceLastSubmit: true },
  });
  const { submitErrors } = useFormState({
    subscription: { submitErrors: true },
  });
  const parameters = useMemo(() => documentParameters(value ?? ''), [value]);
  const problems = useMemo(() => {
    // A refusal applies to the text it was given; once edited, the
    // positions it names may no longer be the same parameters.
    if (dirtySinceLastSubmit) return {};
    const errors: DocumentError[] = submitErrors?.[DOCUMENT_ERRORS] ?? [];
    return errors.reduce<Record<number, string[]>>((result, error) => {
      if (error.parameterIndex !== undefined) {
        const target = error.path.replace(/^parameters\.\d+\.?/, '');
        result[error.parameterIndex] = [
          ...(result[error.parameterIndex] ?? []),
          target ? `${target}: ${error.message}` : error.message,
        ];
      }
      return result;
    }, {});
  }, [submitErrors, dirtySinceLastSubmit]);

  return (
    <section
      aria-label={translate('Declared parameters')}
      className="mb-5"
      data-testid="offering-template-document-parameters"
    >
      <h3 className="text-sm font-medium mb-1">
        {translate('Declared parameters')}
      </h3>
      <p className="text-quaternary text-xs mb-2.5">
        {translate(
          'Each parameter is a value asked for when an offering is created from the template, written into the document at its target paths. Declare them under parameters in the document; the API checks every target path when the template is saved.',
        )}
      </p>
      {parameters.length ? (
        <OfferingTemplateParametersTable
          parameters={parameters}
          problems={problems}
        />
      ) : (
        <p className="text-quaternary text-sm mb-0">
          {translate('The document declares no parameters.')}
        </p>
      )}
    </section>
  );
};

export const OfferingTemplateDocumentField: FC<{ isEdit: boolean }> = ({
  isEdit,
}) => (
  <>
    <TextGroup
      name="document"
      label={translate('Document')}
      description={
        isEdit
          ? translate(
              'The offering in the export format, as JSON or YAML, with its agent configuration and parameters. Changing it creates a new version.',
            )
          : translate(
              'The offering in the export format, as JSON or YAML, with its agent configuration and parameters.',
            )
      }
      required
      validate={validateDocumentText}
      rows={16}
      placeholder={PLACEHOLDER}
      spellCheck={false}
      controlClassName="font-mono text-xs"
    />
    <DocumentParameters />
  </>
);
