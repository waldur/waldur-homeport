import { useQuery } from '@tanstack/react-query';
import { Row, Col } from 'react-bootstrap';
import { Form, Field } from 'react-final-form';
import {
  marketplaceSiteAgentIdentitiesCreate,
  marketplaceSiteAgentIdentitiesUpdate,
  marketplaceProviderOfferingsRetrieve,
  AgentIdentity,
} from 'waldur-js-client';

import { STALE_TIME } from '@/core/constants';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { required } from '@/core/validators';
import { StringField, TextField, FieldError, SubmitButton } from '@/form';
import { AsyncSelectFieldFinal } from '@/form/AsyncSelectField';
import { translate } from '@/i18n';
import { providerOfferingsAutocomplete } from '@/marketplace/common/autocompletes';
import { FormGroup } from '@/marketplace/offerings/FormGroup';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';

interface AgentIdentityFormProps {
  resolve: {
    identity?: AgentIdentity;
    refetch: () => void;
  };
}

export const AgentIdentityForm = ({ resolve }: AgentIdentityFormProps) => {
  const isEdit = Boolean(resolve.identity);

  // Fetch offering details when editing to display the offering name
  const offeringQuery = useQuery({
    queryKey: ['offering', resolve.identity?.offering],
    queryFn: () =>
      marketplaceProviderOfferingsRetrieve({
        path: { uuid: resolve.identity.offering },
      }).then((response) => response.data),
    enabled: isEdit && Boolean(resolve.identity?.offering),
    staleTime: STALE_TIME,
  });

  const initialValues = isEdit
    ? {
        name: resolve.identity.name,
        offering: offeringQuery.data
          ? { uuid: offeringQuery.data.uuid, name: offeringQuery.data.name }
          : resolve.identity.offering
            ? { uuid: resolve.identity.offering }
            : undefined,
        version: resolve.identity.version,
        config_file_path: resolve.identity.config_file_path,
        config_file_content: resolve.identity.config_file_content,
      }
    : undefined;

  const onSubmitMutation = useManagedMutation<any, any, any>({
    mutationFn: (formValues) => {
      const payload = {
        offering: formValues.offering?.uuid,
        name: formValues.name,
        version: formValues.version || null,
        config_file_path: formValues.config_file_path || null,
        config_file_content: formValues.config_file_content || null,
      };

      if (isEdit) {
        return marketplaceSiteAgentIdentitiesUpdate({
          path: { uuid: resolve.identity.uuid },
          body: payload,
        });
      } else {
        return marketplaceSiteAgentIdentitiesCreate({
          body: payload,
        });
      }
    },
    successMessage: isEdit
      ? translate('Agent identity has been updated')
      : translate('Agent identity has been created'),
    errorMessage: isEdit
      ? translate('Unable to update the agent identity.')
      : translate('Unable to create an agent identity.'),
    refetch: resolve.refetch,
    invalidateQueries: [{ queryKey: ['agent-identities'] }],
  });

  // Show loading state while fetching offering details in edit mode
  if (isEdit && resolve.identity?.offering && offeringQuery.isLoading) {
    return (
      <ModalDialog
        title={translate('Edit agent identity: {name}', {
          name: resolve.identity.name,
        })}
        closeButton
        footer={<CloseDialogButton className="flex-equal" />}
      >
        <LoadingSpinner />
      </ModalDialog>
    );
  }

  return (
    <Form
      initialValues={initialValues}
      onSubmit={(values) => onSubmitMutation.mutateAsync(values)}
      render={({ handleSubmit, submitting, invalid }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={
              isEdit
                ? translate('Edit agent identity: {name}', {
                    name: resolve.identity.name,
                  })
                : translate('Create agent identity')
            }
            closeButton
            footer={
              <>
                <CloseDialogButton className="flex-equal" />
                <SubmitButton
                  submitting={submitting}
                  invalid={invalid}
                  label={isEdit ? translate('Update') : translate('Create')}
                  className="btn btn-primary flex-equal"
                />
              </>
            }
          >
            <Row>
              <Col md={6}>
                <FormGroup label={translate('Name')} required>
                  <Field
                    name="name"
                    component={StringField as any}
                    placeholder={translate('Enter agent name')}
                    validate={required}
                  />
                  <Field
                    name="name"
                    component={({ meta }) =>
                      meta.touched && meta.error ? (
                        <FieldError error={meta.error} />
                      ) : null
                    }
                  />
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup label={translate('Version')}>
                  <Field
                    name="version"
                    component={StringField as any}
                    placeholder={translate('e.g., 1.0.0')}
                  />
                </FormGroup>
              </Col>
            </Row>

            <FormGroup label={translate('Offering')} required>
              <AsyncSelectFieldFinal
                name="offering"
                placeholder={translate('Select offering...')}
                loadOptions={(query, prevOptions, page) =>
                  providerOfferingsAutocomplete(
                    { name: query, type: ['Marketplace.Slurm'] },
                    prevOptions,
                    page,
                    ['uuid', 'name'],
                  )
                }
                getOptionValue={(option) => option.uuid}
                getOptionLabel={(option) => option.name}
                validate={required}
              />
              <Field
                name="offering"
                component={({ meta }) =>
                  meta.touched && meta.error ? (
                    <FieldError error={meta.error} />
                  ) : null
                }
              />
            </FormGroup>

            <FormGroup label={translate('Config file path')}>
              <Field
                name="config_file_path"
                component={StringField as any}
                placeholder={translate('e.g., /etc/waldur/agent.yaml')}
              />
            </FormGroup>

            <FormGroup label={translate('Config file content')}>
              <Field
                name="config_file_content"
                component={TextField as any}
                placeholder={translate('Paste configuration content here')}
                rows={6}
              />
            </FormGroup>
          </ModalDialog>
        </form>
      )}
    />
  );
};
