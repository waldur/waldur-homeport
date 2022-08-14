import React, { FunctionComponent, useContext } from 'react';
import { Button, Form } from 'react-bootstrap';
import { FieldArray, FormSection } from 'redux-form';

import { required } from '@waldur/core/validators';
import { FormContainer, SelectField, StringField } from '@waldur/form';
import { FormFieldsContext } from '@waldur/form/context';
import { StaticField } from '@waldur/form/StaticField';
import { translate } from '@waldur/i18n';
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
            dryRunOfferingScript: props.dryRunOfferingScript,
          })}
        </FormSection>
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
