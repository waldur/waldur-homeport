import { useDispatch } from 'react-redux';

import { translate } from '@waldur/i18n';
import { closeModalDialog } from '@waldur/modal/actions';
import {
  createNameField,
  createDescriptionField,
} from '@waldur/resource/actions/base';
import { ResourceActionDialog } from '@waldur/resource/actions/ResourceActionDialog';
import { showSuccess, showErrorResponse } from '@waldur/store/notify';

import { createDatabase } from '../api';

export const CreateDatabaseDialog = ({ resolve: { resource } }) => {
  const dispatch = useDispatch();
  return (
    <ResourceActionDialog
      dialogTitle={translate('Create SQL database in PostgreSQL server')}
      fields={[createNameField(), createDescriptionField()]}
      submitForm={async (formData) => {
        try {
          await createDatabase(resource.uuid, formData);
          dispatch(showSuccess(translate('SQL database has been created.')));
          dispatch(closeModalDialog());
        } catch (e) {
          dispatch(
            showErrorResponse(e, translate('Unable to create SQL database.')),
          );
        }
      }}
    />
  );
};
