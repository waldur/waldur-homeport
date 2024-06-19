import { useRouter } from '@uirouter/react';
import { Modal } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { getFormValues, reduxForm } from 'redux-form';

import { required } from '@waldur/core/validators';
import { CancelButton, FormContainer, SubmitButton } from '@waldur/form';
import { AsyncSelectField } from '@waldur/form/AsyncSelectField';
import { translate } from '@waldur/i18n';
import { organizationAutocomplete } from '@waldur/marketplace/common/autocompletes';
import { closeModalDialog } from '@waldur/modal/actions';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';

import { createProject } from './api';
import { ProjectNameField } from './ProjectNameField';

export const GlobalProjectCreateDialog = reduxForm<
  { customer; name },
  { refetch }
>({
  form: 'GlobalProjectCreateDialog',
})((props) => {
  const dispatch = useDispatch();
  const router = useRouter();
  const formValues = useSelector(
    getFormValues('GlobalProjectCreateDialog'),
  ) as { customer };
  const callback = async (formData) => {
    try {
      const response = await createProject(formData);
      await props.refetch();
      dispatch(showSuccess(translate('Project has been created.')));
      dispatch(closeModalDialog());
      router.stateService.go('project.dashboard', {
        uuid: response.data.uuid,
      });
    } catch (e) {
      dispatch(showErrorResponse(e, translate('Unable to create project.')));
    }
  };

  return (
    <form onSubmit={props.handleSubmit(callback)}>
      <Modal.Header>
        <Modal.Title>{translate('Create project')}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <FormContainer submitting={props.submitting}>
          <AsyncSelectField
            name="customer"
            label={translate('Organization')}
            validate={required}
            placeholder={translate('Select organization...')}
            loadOptions={(query, prevOptions, page) =>
              organizationAutocomplete(query, prevOptions, page, {
                field: ['name', 'url'],
                o: 'name',
              })
            }
            getOptionValue={(option) => option.url}
            noOptionsMessage={() => translate('No organizations')}
          />
          {ProjectNameField({ customer: formValues?.customer })}
        </FormContainer>
      </Modal.Body>
      <Modal.Footer>
        <SubmitButton
          label={translate('Create')}
          submitting={props.submitting}
          disabled={props.invalid}
        />
        <CancelButton label={translate('Cancel')} />
      </Modal.Footer>
    </form>
  );
});
