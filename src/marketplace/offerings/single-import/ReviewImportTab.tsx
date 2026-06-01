import { FunctionComponent } from 'react';
import { Alert, Col, Row } from 'react-bootstrap';
import { useFormState } from 'react-final-form';

import { translate } from '@/i18n';

import { SingleOfferingImportFormData } from './types';

export const ReviewImportTab: FunctionComponent = () => {
  const { values: formData } = useFormState<SingleOfferingImportFormData>();

  const enabledOptions = [
    { key: 'import_components', label: translate('Components') },
    { key: 'import_plans', label: translate('Plans') },
    { key: 'import_screenshots', label: translate('Screenshots') },
    { key: 'import_files', label: translate('Files') },
    { key: 'import_endpoints', label: translate('Access endpoints') },
    {
      key: 'import_organization_groups',
      label: translate('Organization groups'),
    },
    { key: 'import_terms_of_service', label: translate('Terms of service') },
    { key: 'import_plugin_options', label: translate('Plugin options') },
    { key: 'import_secret_options', label: translate('Secret options') },
    { key: 'overwrite_existing', label: translate('Overwrite existing') },
    { key: 'preserve_state', label: translate('Preserve state') },
  ].filter((option) => formData?.[option.key]);

  return (
    <div className="size-sm">
      <Row>
        <Col md={12}>
          <h5>{translate('Import summary')}</h5>

          <p>
            <strong>{translate('File to import:')}</strong>{' '}
            {formData?.importFile?.name || translate('No file selected')}
          </p>

          {formData?.category && (
            <p>
              <strong>{translate('Target category:')}</strong>{' '}
              {formData.category.label ||
                formData.category.name ||
                formData.category.title}
            </p>
          )}

          <h6>{translate('Import options enabled:')}</h6>
          {enabledOptions.length > 0 ? (
            <ul>
              {enabledOptions.map((option) => (
                <li key={option.key}>{option.label}</li>
              ))}
            </ul>
          ) : (
            <p className="text-muted">
              {translate('No special import options enabled')}
            </p>
          )}

          {formData?.import_secret_options && (
            <Alert variant="warning">
              <strong>{translate('Warning:')}</strong>{' '}
              {translate(
                'Secret options will be imported and may overwrite existing secrets.',
              )}
            </Alert>
          )}

          {formData?.overwrite_existing && (
            <Alert variant="warning">
              <strong>{translate('Warning:')}</strong>{' '}
              {translate(
                'Existing offering with the same name will be overwritten.',
              )}
            </Alert>
          )}
        </Col>
      </Row>
    </div>
  );
};
