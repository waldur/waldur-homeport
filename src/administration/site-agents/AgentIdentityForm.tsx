import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { Col, Row } from 'react-bootstrap';
import { Form } from 'react-final-form';
import {
  AgentIdentity,
  marketplaceProviderOfferingsRetrieve,
  marketplaceSiteAgentIdentitiesCreate,
  marketplaceSiteAgentIdentitiesUpdate,
} from 'waldur-js-client';

import { STALE_TIME } from '@/core/constants';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { required } from '@/core/validators';
import { AsyncSelectGroup, StringGroup, SubmitButton, TextGroup } from '@/form';
import { translate } from '@/i18n';
import { providerOfferingsAutocomplete } from '@/marketplace/common/autocompletes';
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

  const loadOfferings = useMemo(
    () =>
      providerOfferingsAutocomplete({
        type: ['Marketplace.Slurm'],
        field: ['uuid', 'name'],
      }),
    [],
  );

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
        footer={<CloseDialogButton className="flex-equal" />}
      >
        <LoadingSpinner />
      </ModalDialog>
    );
  }

  return (
    <Form
      initialValues={initialValues}
      onSubmit={(values) =>
        onSubmitMutation.mutateAsync(values).catch(() => {})
      }
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
                <StringGroup
                  name="name"
                  label={translate('Name')}
                  required
                  validate={required}
                  placeholder={translate('Enter agent name')}
                />
              </Col>
              <Col md={6}>
                <StringGroup
                  name="version"
                  placeholder={translate('e.g., 1.0.0')}
                  label={translate('Version')}
                />
              </Col>
            </Row>

            <AsyncSelectGroup
              name="offering"
              label={translate('Offering')}
              required
              placeholder={translate('Select offering...')}
              loadOptions={loadOfferings}
              getOptionValue={(option) => option.uuid}
              getOptionLabel={(option) => option.name}
              validate={required}
            />

            <StringGroup
              name="config_file_path"
              placeholder={translate('e.g., /etc/waldur/agent.yaml')}
              label={translate('Config file path')}
            />

            <TextGroup
              name="config_file_content"
              placeholder={translate('Paste configuration content here')}
              rows={6}
              label={translate('Config file content')}
            />
          </ModalDialog>
        </form>
      )}
    />
  );
};
