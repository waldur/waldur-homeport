import { DateTime } from 'luxon';
import { Form } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { useAsync } from 'react-use';
import { reduxForm } from 'redux-form';

import { ENV } from '@waldur/configs/default';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { required } from '@waldur/core/validators';
import {
  TextField,
  SelectField,
  FormContainer,
  FieldError,
  SubmitButton,
} from '@waldur/form';
import { AwesomeCheckboxField } from '@waldur/form/AwesomeCheckboxField';
import { DateField } from '@waldur/form/DateField';
import { ImageField } from '@waldur/form/ImageField';
import { validateMaxLength } from '@waldur/form/utils';
import { translate } from '@waldur/i18n';
import { isVisible } from '@waldur/store/config';
import { RootState } from '@waldur/store/reducers';
import { getCustomer, getWorkspace } from '@waldur/workspace/selectors';
import { USER_WORKSPACE } from '@waldur/workspace/types';

import * as api from './api';
import { ProjectNameField } from './ProjectNameField';

export interface ProjectCreateFormData {
  name: string;
  description: string;
  end_date: Date;
  type?;
}

const loadData = async () => {
  const projectTypes = await api.loadProjectTypes();
  const oecdCodes = await api.loadOecdCodes();
  return {
    projectTypes,
    oecdCodes,
  };
};

export const ProjectCreateForm = reduxForm<
  ProjectCreateFormData,
  { onSubmit; onCancel }
>({
  form: 'projectCreate',
})((props) => {
  const { loading, error, value } = useAsync(loadData);
  const customer = useSelector(getCustomer);
  const workspace = useSelector(getWorkspace);
  const showCode = useSelector((state: RootState) =>
    isVisible(state, 'project.oecd_fos_2007_code'),
  );
  const showIndustry = useSelector((state: RootState) =>
    isVisible(state, 'project.show_industry_flag'),
  );
  const isCodeRequired = ENV.plugins.WALDUR_CORE.OECD_FOS_2007_CODE_MANDATORY;

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
    <form onSubmit={props.handleSubmit(props.onSubmit)}>
      <FormContainer submitting={props.submitting}>
        {ProjectNameField({ customer })}
        <TextField
          label={translate('Project description')}
          name="description"
          validate={validateMaxLength}
        />
        {showCode ? (
          <SelectField
            floating={false}
            label={translate('OECD FoS code')}
            help_text={translate(
              'Please select OECD code corresponding to field of science and technology',
            )}
            name="oecd_fos_2007_code"
            options={value.oecdCodes}
            getOptionValue={(option) => option.value}
            getOptionLabel={(option) => `${option.value}. ${option.label}`}
            isClearable={true}
            validate={isCodeRequired ? required : undefined}
            required={isCodeRequired}
          />
        ) : null}
        {showIndustry && (
          <AwesomeCheckboxField
            name="is_industry"
            label={translate(
              'Please mark if project is aimed at industrial use',
            )}
            hideLabel={true}
          />
        )}
        {value.projectTypes.length >= 1 && (
          <SelectField
            label={translate('Project type')}
            name="type"
            options={value.projectTypes}
            getOptionValue={(option) => option.url}
            getOptionLabel={(option) => option.name}
            isClearable={true}
          />
        )}
        <DateField
          name="end_date"
          label={translate('End date')}
          description={translate(
            'The date is inclusive. Once reached, all project resource will be scheduled for termination.',
          )}
          minDate={DateTime.now().plus({ days: 1 }).toISO()}
        />
        <ImageField label={translate('Project image')} name="image" />
        <Form.Group className="text-end">
          <FieldError error={props.error} />
          <SubmitButton
            disabled={props.invalid}
            submitting={props.submitting}
            label={
              workspace === USER_WORKSPACE
                ? translate('Edit request')
                : translate('Add project')
            }
          />
          <button
            type="button"
            className="btn btn-secondary ms-2"
            onClick={props.onCancel}
          >
            {translate('Cancel')}
          </button>
        </Form.Group>
      </FormContainer>
    </form>
  );
});
