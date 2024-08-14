import { pick } from 'lodash';
import { DateTime } from 'luxon';
import { useCallback } from 'react';
import { connect } from 'react-redux';
import { Field, SubmissionError, reduxForm } from 'redux-form';

import { ENV } from '@waldur/configs/default';
import { required } from '@waldur/core/validators';
import { SelectField, SubmitButton, TextField } from '@waldur/form';
import { AwesomeCheckboxField } from '@waldur/form/AwesomeCheckboxField';
import { DateField } from '@waldur/form/DateField';
import { FormContainer } from '@waldur/form/FormContainer';
import { StringField } from '@waldur/form/StringField';
import { validateMaxLength } from '@waldur/form/utils';
import { translate } from '@waldur/i18n';
import { closeModalDialog } from '@waldur/modal/actions';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { getConfig } from '@waldur/store/config';
import { getCustomer } from '@waldur/workspace/selectors';

import { updateProject } from '../actions';
import { EDIT_PROJECT_FORM_ID } from '../constants';
import { OECD_FOS_2007_CODES } from '../OECD_FOS_2007_CODES';
import { ProjectNameField } from '../ProjectNameField';
import { EditProjectProps } from '../types';

const isCodeRequired = ENV.plugins.WALDUR_CORE.OECD_FOS_2007_CODE_MANDATORY;

type FormData = Record<string, any>;

export const EditFieldDialogPure = reduxForm<
  FormData,
  { resolve: EditProjectProps; updateProject(data) }
>({
  form: EDIT_PROJECT_FORM_ID,
})((props) => {
  const processRequest = useCallback(
    (values: FormData, dispatch) => {
      return props
        .updateProject({ data: values })
        .then(() => {
          dispatch(closeModalDialog());
        })
        .catch((e) => {
          if (e.response && e.response.status === 400) {
            throw new SubmissionError(e.response.data);
          }
        });
    },
    [props.updateProject],
  );

  return (
    <form onSubmit={props.handleSubmit(processRequest)}>
      <ModalDialog
        headerLess
        bodyClassName="pb-2"
        footerClassName="border-0 pt-0 gap-2"
        footer={
          <>
            <CloseDialogButton className="flex-grow-1" />
            <SubmitButton
              disabled={props.invalid || !props.dirty}
              submitting={props.submitting}
              label={translate('Confirm')}
              className="btn btn-primary flex-grow-1"
            />
          </>
        }
      >
        <FormContainer submitting={props.submitting}>
          {props.resolve.name === 'customer_name' ? (
            <StringField
              label={translate('Project owner')}
              name="customer_name"
              disabled={true}
            />
          ) : props.resolve.name === 'name' ? (
            ProjectNameField({})
          ) : props.resolve.name === 'description' ? (
            <TextField
              label={translate('Project description')}
              name="description"
              validate={validateMaxLength}
            />
          ) : props.resolve.name === 'is_industry' ? (
            <AwesomeCheckboxField
              name="is_industry"
              label={translate(
                'Please mark if project is aimed at industrial use',
              )}
              hideLabel={true}
            />
          ) : props.resolve.name === 'start_date' ? (
            <Field
              name="start_date"
              label={translate('Start date')}
              description={translate(
                'Once start date is reached, invitations and orders are processed.',
              )}
              component={DateField}
              minDate={DateTime.now().plus({ days: 1 }).toISO()}
            />
          ) : props.resolve.name === 'end_date' ? (
            <Field
              name="end_date"
              label={translate('End date')}
              description={translate(
                'The date is inclusive. Once reached, all project resource will be scheduled for termination.',
              )}
              component={DateField}
              minDate={DateTime.now().plus({ days: 1 }).toISO()}
            />
          ) : props.resolve.name === 'oecd_fos_2007_code' ? (
            <SelectField
              floating={false}
              label={translate('OECD FoS code')}
              help_text={translate(
                'Please select OECD code corresponding to field of science and technology',
              )}
              name="oecd_fos_2007_code"
              options={OECD_FOS_2007_CODES}
              getOptionValue={(option) => option.value}
              getOptionLabel={(option) => `${option.value}. ${option.label}`}
              isClearable={true}
              validate={isCodeRequired ? required : undefined}
              required={isCodeRequired}
            />
          ) : props.resolve.name === 'backend_id' ? (
            <StringField label={translate('Backend ID')} name="backend_id" />
          ) : props.resolve.name === 'slug' ? (
            <StringField label={translate('Slug')} name="slug" />
          ) : null}
        </FormContainer>
      </ModalDialog>
    </form>
  );
});

const mapStateToProps = (state, ownProps) => ({
  customer: getCustomer(state),
  initialValues: pick(ownProps.resolve.project, ownProps.resolve.name),
  project_uuid: ownProps.resolve.project.uuid,
  project_type: ownProps.resolve.project.type_name,
  enforceLatinName: getConfig(state).enforceLatinName,
});

const mapDispatchToProps = (dispatch, ownProps) => ({
  updateProject: (data) =>
    updateProject(
      {
        ...data,
        uuid: ownProps.resolve.project.uuid,
        cache: ownProps.resolve.project,
      },
      dispatch,
    ),
});

const enhance = connect<{}, {}, { resolve: EditProjectProps }>(
  mapStateToProps,
  mapDispatchToProps,
);

export const EditFieldDialog = enhance(EditFieldDialogPure);
