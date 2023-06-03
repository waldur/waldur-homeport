import React, { FunctionComponent, useContext } from 'react';
import { Button, Form } from 'react-bootstrap';
import { FieldArray, FormSection } from 'redux-form';

import { required } from '@waldur/core/validators';
import { FormContainer, SelectField, StringField } from '@waldur/form';
import { FormFieldsContext } from '@waldur/form/context';
import { StaticField } from '@waldur/form/StaticField';
import { translate } from '@waldur/i18n';
import { OFFERING_TYPE_CUSTOM_SCRIPTS } from '@waldur/marketplace-script/constants';
import { Option } from '@waldur/marketplace/common/registry';
import { ProviderFormProps } from '@waldur/providers/types';

import { OfferingOptions } from '../option/OfferingOptions';
import { OfferingScheduler } from '../option/OfferingScheduler';

export interface ManagementStepProps {
  pluginOptionsForm?: React.ComponentType<any>;
  secretOptionsForm?: React.ComponentType<any>;
  showOptions: boolean;
  schedulable?: boolean;
  serviceSettingsForm?: React.ComponentType<ProviderFormProps>;
  offeringTypes: Option[];
  editable: boolean;
  type?: string;
  typeLabel?: string;
  showBackendId?: boolean;
  allowToUpdateService?: boolean;
  openServiceSettingsDetails(): void;
  dryRunOfferingScript(): void;
}

export const ManagementStep: FunctionComponent<ManagementStepProps> = (
  props,
) => {
  const { readOnlyFields } = useContext(FormFieldsContext);
  const ContainerProps = {
    submitting: false,
    clearOnUnmount: false,
  };
  return (
    <>
      <FormContainer {...ContainerProps}>
        {props.editable ? (
          <SelectField
            name="type"
            label={translate('Type')}
            required={true}
            options={props.offeringTypes}
            isClearable={false}
            validate={required}
          />
        ) : (
          <StaticField
            label={translate('Type')}
            value={props.typeLabel}
            {...ContainerProps}
          />
        )}
      </FormContainer>
      {props.editable && props.serviceSettingsForm ? (
        <FormSection name="service_settings">
          {React.createElement(props.serviceSettingsForm, {
            container: ContainerProps,
          })}
        </FormSection>
      ) : !props.showOptions &&
        props.typeLabel &&
        props.allowToUpdateService ? (
        <Form.Group>
          <Button onClick={props.openServiceSettingsDetails}>
            {translate('Update service settings')}
          </Button>
        </Form.Group>
      ) : null}
      {props.schedulable && (
        <FieldArray name="schedules" component={OfferingScheduler} />
      )}
      {props.type === OFFERING_TYPE_CUSTOM_SCRIPTS ? (
        // NOTE: In custom scripts offering types the options (User input fields) are wrapped in the secretOptionsForm component
        props.secretOptionsForm &&
        React.createElement(props.secretOptionsForm, {
          dryRunOfferingScript: props.dryRunOfferingScript,
        })
      ) : (
        <>
          {props.showOptions && (
            <FieldArray
              name="options"
              component={OfferingOptions}
              readOnly={readOnlyFields.includes('options')}
            />
          )}
          {props.secretOptionsForm && (
            <FormSection name="secret_options">
              {React.createElement(props.secretOptionsForm, {
                container: ContainerProps,
              })}
            </FormSection>
          )}
        </>
      )}
      {props.showBackendId && (
        <FormContainer {...ContainerProps}>
          <StringField name="backend_id" label={translate('Backend ID')} />
        </FormContainer>
      )}
      {props.pluginOptionsForm && (
        <FormSection name="plugin_options">
          {React.createElement(props.pluginOptionsForm, {
            container: ContainerProps,
          })}
        </FormSection>
      )}
    </>
  );
};
