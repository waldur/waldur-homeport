import { Button } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { change } from 'redux-form';

import { translate } from '@waldur/i18n';
import { closeModalDialog, openModalDialog } from '@waldur/modal/actions';
import { ProjectCreateDialog } from '@waldur/project/ProjectCreateDialog';

import { FormGroup } from '../offerings/FormGroup';

import { ORDER_FORM_ID } from './constants';
import { orderFormValues } from './utils';

const FIELD_ID = 'project_create_request';

export const ProjectCreateGroup = () => {
  const dispatch = useDispatch();
  const initialValues = useSelector((state) =>
    orderFormValues(state, FIELD_ID),
  );
  const openProjectCreateDialog = () =>
    dispatch(
      openModalDialog(ProjectCreateDialog, {
        size: 'lg',
        onSubmit: (formData) => {
          dispatch(change(ORDER_FORM_ID, FIELD_ID, formData));
          dispatch(closeModalDialog());
        },
        onCancel: () => {
          dispatch(closeModalDialog());
        },
        initialValues,
      }),
    );
  return (
    <FormGroup label={translate('Project')} required={true}>
      <Button onClick={openProjectCreateDialog}>
        {initialValues ? (
          <i className="fa fa-pencil" />
        ) : (
          <i className="fa fa-plus" />
        )}{' '}
        {initialValues
          ? translate('Edit project request ({name})', {
              name: initialValues.name,
            })
          : translate('Create project request')}
      </Button>
    </FormGroup>
  );
};
