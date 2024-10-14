import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { Form } from 'react-bootstrap';
import { connect, useDispatch, useSelector } from 'react-redux';
import { Field, FieldArray, formValueSelector, reduxForm } from 'redux-form';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { FormGroup, SelectField, SubmitButton } from '@waldur/form';
import { AsyncSelectField } from '@waldur/form/AsyncSelectField';
import { InputField } from '@waldur/form/InputField';
import { translate } from '@waldur/i18n';
import { offeringsAutocomplete } from '@waldur/marketplace/common/autocompletes';
import { closeModalDialog } from '@waldur/modal/actions';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { createMigration, loadVolumeTypes } from '@waldur/openstack/api';
import { TENANT_TYPE } from '@waldur/openstack/constants';
import { RESOURCE_ACTION_FORM } from '@waldur/resource/actions/constants';
import { showSuccess, showErrorResponse } from '@waldur/store/notify';
import { RootState } from '@waldur/store/reducers';

import { SubnetsTable } from './SubnetsTable';
import { VolumeTypesTable } from './VolumeTypesTable';

const selector = formValueSelector(RESOURCE_ACTION_FORM);

const offeringSelector = (state: RootState) => selector(state, 'offering');

export const MigrateTenantDialog = connect<
  {},
  {},
  { resolve: { resource; refetch } }
>((_, ownProps) => ({
  initialValues: { name: ownProps.resolve.resource.name },
}))(
  reduxForm<{}, { resolve: { resource; refetch } }>({
    form: RESOURCE_ACTION_FORM,
  })(
    ({
      handleSubmit,
      submitting,
      invalid,
      resolve: { resource, refetch },
      change,
    }) => {
      const dispatch = useDispatch();
      const offering = useSelector(offeringSelector);

      const submitForm = async (formData) => {
        try {
          await createMigration({
            src_resource: resource.uuid,
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
            },
          });
          dispatch(
            showSuccess(translate('OpenStack migration has been initiated.')),
          );
          dispatch(closeModalDialog());
          if (refetch) {
            await refetch();
          }
        } catch (e) {
          dispatch(
            showErrorResponse(
              e,
              translate('Unable to migrate OpenStack tenant.'),
            ),
          );
        }
      };

      useEffect(() => {
        change('plan', offering ? offering.plans[0] : null);
        change('volume_types', []);
      }, [offering]);

      const queryResult = useQuery(
        ['MigrateTenantDialog', offering?.uuid],
        async () => {
          if (!offering) {
            return {};
          }
          const sourceVolumeTypes = await loadVolumeTypes({
            tenant_uuid: resource.uuid,
          });
          const destinationVolumeTypes = await loadVolumeTypes({
            settings_uuid: offering.scope_uuid,
          });
          return { sourceVolumeTypes, destinationVolumeTypes };
        },
      );

      return (
        <form onSubmit={handleSubmit(submitForm)}>
          <ModalDialog
            title={translate('Migrate tenant to another OpenStack deployment')}
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
            <Field name="name" label={translate('Name')} component={FormGroup}>
              <InputField />
            </Field>
            <Field
              name="offering"
              label={translate('Offering')}
              component={FormGroup}
            >
              <AsyncSelectField
                loadOptions={(query, prevOptions, currentPage) =>
                  offeringsAutocomplete(
                    { name: query, type: TENANT_TYPE },
                    prevOptions,
                    currentPage,
                    false,
                    ['name', 'uuid', 'customer_name', 'plans', 'scope_uuid'],
                  )
                }
                getOptionLabel={({ name, customer_name }) => (
                  <>
                    {name} | {customer_name}
                  </>
                )}
                getOptionKey={({ uuid }) => uuid}
              />
            </Field>

            {offering && (
              <>
                <Field
                  name="plan"
                  label={translate('Plan')}
                  component={FormGroup}
                >
                  <SelectField
                    options={offering.plans}
                    getOptionLabel={({ name }) => name}
                    getOptionKey={({ uuid }) => uuid}
                  />
                </Field>
                {queryResult.isLoading ? (
                  <LoadingSpinner />
                ) : queryResult.data ? (
                  <>
                    <Form.Group>
                      <Form.Label>{translate('Volume types')}</Form.Label>
                      <FieldArray
                        name="volumeTypes"
                        component={VolumeTypesTable}
                        options={queryResult.data}
                      />
                    </Form.Group>
                    <Form.Group>
                      <Form.Label>{translate('Subnets')}</Form.Label>
                      <FieldArray name="subnets" component={SubnetsTable} />
                    </Form.Group>
                  </>
                ) : null}
              </>
            )}
          </ModalDialog>
        </form>
      );
    },
  ),
);
