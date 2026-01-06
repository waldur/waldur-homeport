import { useState, useEffect } from 'react';
import { Alert, Button, Spinner } from 'react-bootstrap';
import { Field, Form } from 'react-final-form';
import {
  supportSettingsAtlassianDiscoverCustomFields,
  supportSettingsAtlassianDiscoverPriorities,
} from 'waldur-js-client';

import { SelectField } from '@waldur/form';
import { translate } from '@waldur/i18n';
import { FormGroup } from '@waldur/marketplace/offerings/FormGroup';

import type { AtlassianCredentials, DiscoveryState } from '../types';

interface FieldMappingStepProps {
  credentials: AtlassianCredentials;
  project: NonNullable<DiscoveryState['selectedProject']>;
  selectedRequestTypes: DiscoveryState['selectedRequestTypes'];
  onMappingsSet: (
    mappings: DiscoveryState['fieldMappings'],
    customFields: DiscoveryState['customFields'],
    priorities: DiscoveryState['priorities'],
  ) => void;
  onBack: () => void;
  onCancel: () => void;
}

export const FieldMappingStep = ({
  credentials,
  project,
  selectedRequestTypes,
  onMappingsSet,
  onBack,
  onCancel,
}: FieldMappingStepProps) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [customFields, setCustomFields] = useState<
    DiscoveryState['customFields']
  >([]);
  const [priorities, setPriorities] = useState<DiscoveryState['priorities']>(
    [],
  );

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        const requestTypeId = selectedRequestTypes[0]?.id;
        const [fieldsResponse, prioritiesResponse] = await Promise.all([
          supportSettingsAtlassianDiscoverCustomFields({
            body: {
              ...credentials,
              project_id: project.id,
              request_type_id: requestTypeId,
            },
          }),
          supportSettingsAtlassianDiscoverPriorities({
            body: credentials,
          }),
        ]);
        setCustomFields(fieldsResponse.data || []);
        setPriorities(prioritiesResponse.data || []);
      } catch (e: any) {
        setError(
          e.response?.data?.detail ||
            e.message ||
            translate('Failed to load field configuration'),
        );
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [credentials, project, selectedRequestTypes]);

  const handleSubmit = (values: DiscoveryState['fieldMappings']) => {
    onMappingsSet(values, customFields, priorities);
  };

  if (loading) {
    return (
      <div className="text-center py-10">
        <Spinner animation="border" />
        <p className="mt-4">
          {translate('Loading custom fields and priorities...')}
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <Alert variant="danger">{error}</Alert>
        <div className="d-flex justify-content-end gap-2">
          <Button variant="secondary" onClick={onBack}>
            {translate('Back')}
          </Button>
        </div>
      </div>
    );
  }

  const fieldOptions = [
    { value: '', label: translate('-- Not mapped --') },
    ...customFields.map((f) => ({
      value: f.id,
      label: `${f.name} (${f.id})`,
    })),
  ];

  const priorityOptions = [
    { value: '', label: translate('-- Not set --') },
    ...priorities.map((p) => ({
      value: p.id,
      label: p.name,
    })),
  ];

  return (
    <Form
      onSubmit={handleSubmit}
      render={({ handleSubmit }) => (
        <form onSubmit={handleSubmit}>
          <h4 className="mb-4">{translate('Field Mapping')}</h4>
          <p className="text-muted mb-4">
            {translate(
              'Map Waldur fields to Atlassian custom fields. These mappings allow Waldur to automatically populate issue fields.',
            )}
          </p>

          <div className="row">
            <div className="col-md-6">
              <FormGroup
                label={translate('Reporter Field')}
                description={translate(
                  'Custom field for storing the reporter email',
                )}
              >
                <Field
                  name="reporter_field"
                  component={SelectField as any}
                  options={fieldOptions}
                  simpleValue
                />
              </FormGroup>
            </div>

            <div className="col-md-6">
              <FormGroup
                label={translate('Impact Field')}
                description={translate(
                  'Custom field for storing the impact level',
                )}
              >
                <Field
                  name="impact_field"
                  component={SelectField as any}
                  options={fieldOptions}
                  simpleValue
                />
              </FormGroup>
            </div>

            <div className="col-md-6">
              <FormGroup
                label={translate('Organisation Field')}
                description={translate(
                  'Custom field for storing the organisation name',
                )}
              >
                <Field
                  name="organisation_field"
                  component={SelectField as any}
                  options={fieldOptions}
                  simpleValue
                />
              </FormGroup>
            </div>

            <div className="col-md-6">
              <FormGroup
                label={translate('Project Field')}
                description={translate(
                  'Custom field for storing the project name',
                )}
              >
                <Field
                  name="project_field"
                  component={SelectField as any}
                  options={fieldOptions}
                  simpleValue
                />
              </FormGroup>
            </div>

            <div className="col-md-6">
              <FormGroup
                label={translate('Affected Resource Field')}
                description={translate(
                  'Custom field for storing the affected resource',
                )}
              >
                <Field
                  name="affected_resource_field"
                  component={SelectField as any}
                  options={fieldOptions}
                  simpleValue
                />
              </FormGroup>
            </div>

            <div className="col-md-6">
              <FormGroup
                label={translate('Caller Field')}
                description={translate('Custom field for storing the caller')}
              >
                <Field
                  name="caller_field"
                  component={SelectField as any}
                  options={fieldOptions}
                  simpleValue
                />
              </FormGroup>
            </div>

            <div className="col-md-6">
              <FormGroup
                label={translate('Template Field')}
                description={translate(
                  'Custom field for storing the template name',
                )}
              >
                <Field
                  name="template_field"
                  component={SelectField as any}
                  options={fieldOptions}
                  simpleValue
                />
              </FormGroup>
            </div>

            <div className="col-md-6">
              <FormGroup
                label={translate('Waldur Backend ID Field')}
                description={translate(
                  'Custom field for storing the Waldur backend ID',
                )}
              >
                <Field
                  name="waldur_backend_id_field"
                  component={SelectField as any}
                  options={fieldOptions}
                  simpleValue
                />
              </FormGroup>
            </div>

            <div className="col-md-6">
              <FormGroup
                label={translate('Default Priority')}
                description={translate(
                  'Default priority for new issues when not specified',
                )}
              >
                <Field
                  name="default_priority"
                  component={SelectField as any}
                  options={priorityOptions}
                  simpleValue
                />
              </FormGroup>
            </div>
          </div>

          {customFields.length === 0 && (
            <Alert variant="info" className="mt-4">
              {translate(
                'No custom fields found. You can skip this step and configure field mappings later.',
              )}
            </Alert>
          )}

          <div className="d-flex justify-content-end gap-2 mt-6">
            <Button variant="secondary" onClick={onCancel}>
              {translate('Cancel')}
            </Button>
            <Button variant="tertiary" onClick={onBack}>
              {translate('Back')}
            </Button>
            <Button type="submit" variant="primary">
              {translate('Continue')}
            </Button>
          </div>
        </form>
      )}
    />
  );
};
