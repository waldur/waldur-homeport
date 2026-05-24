import { useQuery } from '@tanstack/react-query';
import arrayMutators from 'final-form-arrays';
import { FC, useEffect, useMemo } from 'react';
import { Form as BootstrapForm } from 'react-bootstrap';
import { Form, Field, useForm, useFormState } from 'react-final-form';
import { FieldArray } from 'react-final-form-arrays';
import {
  Offering,
  openstackMigrationsCreate,
  openstackNetworksList,
} from 'waldur-js-client';

import { LoadingSpinner } from '@/core/LoadingSpinner';
import { required } from '@/core/validators';
import { FormGroup, SelectField, SubmitButton } from '@/form';
import { AwesomeCheckboxField } from '@/form/AwesomeCheckboxField';
import { InputField } from '@/form/InputField';
import { AsyncSelect as AsyncSelect } from '@/form/select';
import { translate } from '@/i18n';
import { publicOfferingsAutocomplete } from '@/marketplace/common/autocompletes';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { loadSubnets, loadVolumeTypes } from '@/openstack/api';
import { TENANT_TYPE } from '@/openstack/constants';

import { SubnetsTable } from './SubnetsTable';
import { VolumeTypesTable } from './VolumeTypesTable';

interface MigrateTenantDialogProps {
  resolve: {
    resource: any;
    refetch(): void;
  };
}

interface MigrateTenantFormData {
  name: string;
  offering: Offering;
  plan: any;
  volumeTypes?: Array<{
    source: { uuid: string; name: string };
    destination: { uuid: string; name: string };
  }>;
  subnets?: Array<{
    source: string;
    destination: string;
  }>;
  networks?: Array<{ label: string; value: string }>;
  skip_connection_extnet?: boolean;
  sync_instance_ports?: boolean;
}

const FormWatcher: FC = () => {
  const { change } = useForm();
  const { values } = useFormState({ subscription: { values: true } });
  const offering = values.offering;

  useEffect(() => {
    if (offering) {
      change('plan', offering.plans?.[0] || null);
    } else {
      change('plan', null);
    }
    change('volumeTypes', []);
  }, [offering, change]);

  return null;
};

export const MigrateTenantDialog: FC<MigrateTenantDialogProps> = ({
  resolve: { resource, refetch },
}) => {
  const loadOfferings = useMemo(
    () =>
      publicOfferingsAutocomplete({
        type: [TENANT_TYPE],
        allowed_customer_uuid: resource.customer_uuid,
        field: ['name', 'uuid', 'customer_name', 'plans', 'scope_uuid'],
      }),
    [resource.customer_uuid],
  );

  const migrateMutation = useManagedMutation<any, any, MigrateTenantFormData>({
    mutationFn: (formData) =>
      openstackMigrationsCreate({
        body: {
          name: formData.name,
          src_resource: resource.marketplace_resource_uuid,
          dst_offering: formData.offering.uuid,
          dst_plan: formData.plan.uuid,
          mappings: {
            volume_types: formData.volumeTypes?.map((type) => ({
              src_type_uuid: type.source.uuid,
              dst_type_uuid: type.destination.uuid,
            })),
            subnets: formData.subnets?.map((type) => ({
              src_cidr: type.source,
              dst_cidr: type.destination,
            })),
            skip_connection_extnet: formData.skip_connection_extnet,
            sync_instance_ports: formData.sync_instance_ports,
            networks: formData.networks?.map(({ value }) => value),
          },
        },
      }),
    successMessage: translate('OpenStack replication has been initiated.'),
    errorMessage: translate('Unable to replicate OpenStack tenant.'),
    refetch,
  });

  return (
    <Form<MigrateTenantFormData>
      onSubmit={(values) => migrateMutation.mutateAsync(values)}
      initialValues={{ name: resource.name } as any}
      mutators={{ ...arrayMutators }}
      render={({ handleSubmit, submitting, invalid, values }) => (
        <form onSubmit={handleSubmit}>
          <FormWatcher />
          <ModalDialog
            title={translate(
              'Replicate tenant to another OpenStack deployment',
            )}
            footer={
              <div>
                <CloseDialogButton className="me-3" />
                <SubmitButton
                  disabled={invalid}
                  submitting={submitting}
                  label={translate('Submit')}
                />
              </div>
            }
          >
            <Field
              name="name"
              label={translate('Name')}
              component={FormGroup}
              validate={required}
            >
              <InputField />
            </Field>
            <Field
              name="offering"
              label={translate('Offering')}
              component={FormGroup}
              validate={required}
            >
              <AsyncSelect
                loadOptions={loadOfferings}
                getOptionLabel={({ name, customer_name }) =>
                  `${name} | ${customer_name}`
                }
                getOptionValue={({ uuid }) => uuid}
              />
            </Field>

            {values.offering && (
              <MigrateTenantFields
                offering={values.offering}
                resource={resource}
              />
            )}
          </ModalDialog>
        </form>
      )}
    />
  );
};

const MigrateTenantFields = ({ offering, resource }) => {
  const queryResult = useQuery({
    queryKey: ['MigrateTenantDialog', offering?.uuid],
    queryFn: async () => {
      const sourceVolumeTypes = await loadVolumeTypes({
        tenant_uuid: resource.uuid,
      });
      const destinationVolumeTypes = await loadVolumeTypes({
        settings_uuid: offering.scope_uuid,
      });
      const sourceSubnets = await loadSubnets({
        tenant_uuid: resource.uuid,
        field: ['name', 'cidr'],
      });
      const networks = (
        await openstackNetworksList({
          query: {
            tenant_uuid: resource.uuid,
            field: ['name', 'uuid'],
            direct_only: true,
          },
        })
      ).data.map(({ uuid, name }) => ({ label: name, value: uuid }));
      return {
        sourceVolumeTypes,
        destinationVolumeTypes,
        sourceSubnets,
        networks,
      };
    },
    enabled: Boolean(offering),
  });

  return (
    <>
      <Field
        name="plan"
        label={translate('Plan')}
        component={FormGroup}
        validate={required}
      >
        <SelectField
          options={offering.plans}
          getOptionLabel={({ name }) => name}
          getOptionValue={({ uuid }) => uuid}
        />
      </Field>
      {queryResult.isLoading ? (
        <LoadingSpinner />
      ) : queryResult.data ? (
        <>
          <BootstrapForm.Group className="mb-7">
            <BootstrapForm.Label className="form-label">
              {translate('Volume types')}
            </BootstrapForm.Label>
            <FieldArray name="volumeTypes">
              {({ fields }) => (
                <VolumeTypesTable fields={fields} options={queryResult.data} />
              )}
            </FieldArray>
          </BootstrapForm.Group>
          <Field
            name="networks"
            label={translate('Networks')}
            component={FormGroup}
          >
            <SelectField options={queryResult.data.networks} isMulti />
          </Field>
          <BootstrapForm.Group className="mb-7">
            <BootstrapForm.Label className="form-label">
              {translate('Subnets')}
            </BootstrapForm.Label>
            <FieldArray name="subnets">
              {({ fields }) => (
                <SubnetsTable
                  fields={fields}
                  sourceSubnets={queryResult.data.sourceSubnets}
                />
              )}
            </FieldArray>
          </BootstrapForm.Group>
        </>
      ) : null}

      <Field
        name="skip_connection_extnet"
        label={translate('Skip connection to external network')}
        component={FormGroup}
      >
        <AwesomeCheckboxField />
      </Field>
      <Field
        name="sync_instance_ports"
        label={translate('Copy ports connected to instances')}
        component={FormGroup}
      >
        <AwesomeCheckboxField />
      </Field>
    </>
  );
};
