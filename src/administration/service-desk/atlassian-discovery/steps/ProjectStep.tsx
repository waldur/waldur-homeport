import { CaretLeftIcon, CaretRightIcon } from '@phosphor-icons/react';
import { FC, useState, useEffect } from 'react';
import { Alert, Card, FormCheck, Spinner } from 'react-bootstrap';
import { useForm, useFormState } from 'react-final-form';
import { supportSettingsAtlassianDiscoverProjects } from 'waldur-js-client';

import { SubmitButton } from '@/form/SubmitButton';
import { translate } from '@/i18n';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { WizardModal, WizardStepProps } from '@/wizard';

import type { AtlassianFormValues } from '../types';

/**
 * Step 2: Project Selection
 *
 * Fetches available Service Desk projects and allows user to select one.
 * Stores projects and selection in form values.
 */
export const ProjectStep: FC<WizardStepProps> = (props) => {
  const form = useForm<AtlassianFormValues>();
  const { values } = useFormState<AtlassianFormValues>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Extract credentials from form values
  const credentials = {
    api_url: values.api_url,
    auth_method: values.auth_method,
    email: values.email,
    token: values.token,
    personal_access_token: values.personal_access_token,
    username: values.username,
    password: values.password,
    verify_ssl: values.verify_ssl,
  };

  // Load projects when step mounts
  useEffect(() => {
    const loadProjects = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await supportSettingsAtlassianDiscoverProjects({
          body: credentials,
        });
        form.change('projects', response.data || []);
      } catch (e: any) {
        setError(
          e.response?.data?.detail ||
            e.message ||
            translate('Failed to load projects'),
        );
      } finally {
        setLoading(false);
      }
    };

    loadProjects();
  }, []);

  const handleContinue = () => {
    // Reset downstream state when project changes
    form.change('requestTypes', []);
    form.change('selectedRequestTypeIds', []);
    form.change('customFields', []);
    form.change('fieldMappings', {});
    // Advance to next step
    props.handleSubmit();
  };

  // Custom footer for this step
  const renderFooter = () => (
    <>
      <SubmitButton
        submitting={false}
        variant="tertiary"
        className="min-w-125px me-auto"
        onClick={() => props.onPrev(values)}
        type="button"
        label={translate('Back')}
        iconNode={<CaretLeftIcon weight="bold" />}
        iconOnLeft
      />
      <CloseDialogButton className="min-w-125px" />
      <SubmitButton
        submitting={false}
        disabled={!values.selectedProjectId || loading}
        label={translate('Continue')}
        onClick={handleContinue}
        type="button"
        className="btn-icon-right min-w-125px"
      >
        <span className="svg-icon svg-icon-2">
          <CaretRightIcon weight="bold" />
        </span>
      </SubmitButton>
    </>
  );

  if (loading) {
    return (
      <WizardModal {...props} renderFooter={renderFooter}>
        <div className="text-center py-10">
          <Spinner animation="border" />
          <p className="mt-4">
            {translate('Discovering Service Desk projects...')}
          </p>
        </div>
      </WizardModal>
    );
  }

  if (error) {
    return (
      <WizardModal {...props} renderFooter={renderFooter}>
        <Alert variant="danger">{error}</Alert>
      </WizardModal>
    );
  }

  if (values.projects.length === 0) {
    return (
      <WizardModal {...props} renderFooter={renderFooter}>
        <Alert variant="warning">
          {translate(
            'No Service Desk projects found. Please ensure you have access to at least one Service Desk project.',
          )}
        </Alert>
      </WizardModal>
    );
  }

  return (
    <WizardModal {...props} renderFooter={renderFooter}>
      <h4 className="mb-4">{translate('Select Service Desk Project')}</h4>
      <p className="text-muted mb-4">
        {translate(
          'Select the Service Desk project that will be used for support tickets.',
        )}
      </p>

      <div className="row g-3 mb-6">
        {values.projects.map((project) => (
          <div key={project.id} className="col-md-6">
            <Card
              className={`cursor-pointer h-100 ${
                values.selectedProjectId === project.id
                  ? 'border-primary border-2'
                  : 'border-secondary'
              }`}
              onClick={() => form.change('selectedProjectId', project.id)}
            >
              <Card.Body>
                <div className="d-flex align-items-start">
                  <FormCheck
                    type="radio"
                    className="me-3"
                    checked={values.selectedProjectId === project.id}
                    onChange={() =>
                      form.change('selectedProjectId', project.id)
                    }
                  />
                  <div>
                    <h5 className="mb-1">
                      {project.name}{' '}
                      <span className="text-muted">({project.key})</span>
                    </h5>
                    {project.description && (
                      <p className="text-muted mb-0 small">
                        {project.description}
                      </p>
                    )}
                  </div>
                </div>
              </Card.Body>
            </Card>
          </div>
        ))}
      </div>
    </WizardModal>
  );
};
