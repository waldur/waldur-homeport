import { DateTime } from 'luxon';
import { FC } from 'react';
import { Form } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { useAsync } from 'react-use';
import { getFormValues, InjectedFormProps } from 'redux-form';

import { ENV } from '@waldur/configs/default';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { required } from '@waldur/core/validators';
import { isFeatureVisible } from '@waldur/features/connect';
import { ProjectFeatures } from '@waldur/FeaturesEnums';
import {
  TextField,
  SelectField,
  FormContainer,
  FieldError,
} from '@waldur/form';
import { AsyncSelectField } from '@waldur/form/AsyncSelectField';
import { AwesomeCheckboxField } from '@waldur/form/AwesomeCheckboxField';
import { DateField } from '@waldur/form/DateField';
import { ImageField } from '@waldur/form/ImageField';
import { validateMaxLength } from '@waldur/form/utils';
import { translate } from '@waldur/i18n';
import { organizationAutocomplete } from '@waldur/marketplace/common/autocompletes';
import { Customer } from '@waldur/workspace/types';

import * as api from './api';
import { OECD_FOS_2007_CODES } from './OECD_FOS_2007_CODES';
import { ProjectNameField } from './ProjectNameField';

export interface ProjectCreateFormData {
  name: string;
  description: string;
  end_date: Date;
  type?;
  customer?: Customer;
}

interface ProjectCreateFormProps
  extends Partial<InjectedFormProps<ProjectCreateFormData>> {
  onSubmit: any;
}

const loadData = async () => {
  const projectTypes = await api.loadProjectTypes();
  return {
    projectTypes,
  };
};

export const ProjectCreateForm: FC<ProjectCreateFormProps> = (props) => {
  const { loading, error, value } = useAsync(loadData);
  const isCodeRequired = ENV.plugins.WALDUR_CORE.OECD_FOS_2007_CODE_MANDATORY;

  const formValues = useSelector(
    getFormValues(props.form),
  ) as ProjectCreateFormData;

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <h3 className="text-center">
        {translate('Unable to load project types.')}
      </h3>
    );
  }

  return (
    <FormContainer submitting={props.submitting} className="size-lg" asRow>
      <AsyncSelectField
        name="customer"
        label={translate('Organization')}
        validate={required}
        placeholder={translate('Select...')}
        loadOptions={(query, prevOptions, page) =>
          organizationAutocomplete(query, prevOptions, page, {
            field: ['name', 'url'],
            o: 'name',
          })
        }
        getOptionValue={(option) => option.url}
        noOptionsMessage={() => translate('No organizations')}
        isDisabled={props.initialValues?.customer}
      />
      {ProjectNameField({ customer: formValues?.customer })}
      {isFeatureVisible(ProjectFeatures.show_description_in_create_dialog) && (
        <TextField
          label={translate('Project description')}
          name="description"
          placeholder={translate('Enter a description') + '...'}
          validate={validateMaxLength}
        />
      )}
      {isFeatureVisible(ProjectFeatures.show_industry_flag) && (
        <AwesomeCheckboxField
          name="is_industry"
          label={translate('Please mark if project is aimed at industrial use')}
          hideLabel={true}
        />
      )}
      {isFeatureVisible(ProjectFeatures.oecd_fos_2007_code) ? (
        <SelectField
          label={translate('OECD FoS code')}
          description={translate(
            'Choose a science code identifying project activities.',
          )}
          name="oecd_fos_2007_code"
          options={OECD_FOS_2007_CODES}
          getOptionValue={(option) => option.value}
          getOptionLabel={(option) => `${option.value}. ${option.label}`}
          isClearable={true}
          validate={isCodeRequired ? required : undefined}
          required={isCodeRequired}
        />
      ) : null}
      {isFeatureVisible(ProjectFeatures.show_type_in_create_dialog) &&
        value.projectTypes.length >= 1 && (
          <SelectField
            label={translate('Project type')}
            name="type"
            options={value.projectTypes}
            getOptionValue={(option) => option.url}
            getOptionLabel={(option) => option.name}
            isClearable={true}
          />
        )}
      {isFeatureVisible(ProjectFeatures.show_start_date_in_create_dialog) && (
        <DateField
          name="start_date"
          label={translate('Start date')}
          description={translate(
            'Once start date is reached, invitations and orders are processed.',
          )}
          minDate={DateTime.now().plus({ days: 1 }).toISO()}
          containerClassName="col-lg"
        />
      )}
      {isFeatureVisible(ProjectFeatures.show_end_date_in_create_dialog) && (
        <DateField
          name="end_date"
          label={translate('End date')}
          description={translate(
            'The date is inclusive. Once reached, all project resource will be scheduled for termination.',
          )}
          minDate={DateTime.now().plus({ days: 1 }).toISO()}
          containerClassName="col-lg"
        />
      )}
      {isFeatureVisible(ProjectFeatures.show_image_in_create_dialog) && (
        <ImageField label={translate('Project image')} name="image" />
      )}
      <Form.Group>
        <FieldError error={props.error} />
      </Form.Group>
    </FormContainer>
  );
};
