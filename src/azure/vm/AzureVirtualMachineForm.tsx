import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { formValueSelector } from 'redux-form';

import { virtualMachineName } from '@waldur/azure/common/validators';
import { required } from '@waldur/core/validators';
import {
  FormContainer,
  SelectField,
  StringField,
  TextField,
} from '@waldur/form';
import { AsyncSelectField } from '@waldur/form/AsyncSelectField';
import { translate } from '@waldur/i18n';
import { ProjectField } from '@waldur/marketplace/details/ProjectField';
import { OfferingConfigurationFormProps } from '@waldur/marketplace/types';

import {
  getImageLabel,
  getSizeLabel,
  loadImageOptions,
  loadLocationOptions,
  loadSizeOptions,
} from './utils';

export const AzureVirtualMachineForm: React.FC<OfferingConfigurationFormProps> = (
  props,
) => {
  const location = useSelector((state) =>
    formValueSelector(props.form)(state, 'attributes.location'),
  );
  const zone = useSelector((state) =>
    formValueSelector(props.form)(state, 'attributes.availability_zone'),
  );

  // Reset size selection when either location or zone selection is changed
  useEffect(() => {
    props.change('attributes.size', undefined);
  }, [location, zone]);

  // Reset image selection when either location is changed
  useEffect(() => {
    props.change('attributes.image', undefined);
  }, [location]);

  return (
    <form className="form-horizontal">
      <FormContainer
        submitting={false}
        labelClass="col-sm-3"
        controlClass="col-sm-9"
      >
        <ProjectField />
        <StringField
          label={translate('Name')}
          name="attributes.name"
          description={translate(
            'This name will be visible in accounting data.',
          )}
          validate={[required, virtualMachineName]}
          required={true}
        />
        <AsyncSelectField
          name="attributes.location"
          label={translate('Location')}
          required={true}
          loadOptions={(query, prevOptions, currentPage) =>
            loadLocationOptions(
              props.offering.scope_uuid,
              query,
              prevOptions,
              currentPage,
            )
          }
        />
        <SelectField
          name="attributes.availability_zone"
          label={translate('Availability zone')}
          required={true}
          options={[
            { label: translate('First'), value: 1 },
            { label: translate('Second'), value: 2 },
            { label: translate('Third'), value: 3 },
          ]}
        />
        <AsyncSelectField
          name="attributes.size"
          label={translate('Size')}
          required={true}
          validate={required}
          isDisabled={!location || !zone}
          loadOptions={(query, prevOptions, currentPage) =>
            loadSizeOptions(
              props.offering.scope_uuid,
              location.uuid,
              zone.value,
              query,
              prevOptions,
              currentPage,
            )
          }
          getOptionLabel={getSizeLabel}
        />
        <AsyncSelectField
          name="attributes.image"
          label={translate('Image')}
          required={true}
          validate={required}
          loadOptions={(query, prevOptions, currentPage) =>
            loadImageOptions(
              props.offering.scope_uuid,
              location.uuid,
              query,
              prevOptions,
              currentPage,
            )
          }
          getOptionLabel={getImageLabel}
          isDisabled={!location}
        />
        <TextField
          label={translate('Description')}
          name="attributes.description"
        />
      </FormContainer>
    </form>
  );
};
