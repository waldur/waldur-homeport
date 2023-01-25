import { FC } from 'react';
import { useDispatch } from 'react-redux';

import { translate } from '@waldur/i18n';
import { closeModalDialog } from '@waldur/modal/actions';
import {
  createNameField,
  createDescriptionField,
} from '@waldur/resource/actions/base';
import { ResourceActionDialog } from '@waldur/resource/actions/ResourceActionDialog';
import { ActionDialogProps } from '@waldur/resource/actions/types';
import { showSuccess, showErrorResponse } from '@waldur/store/notify';

import { createDatabase } from '../api';

export const CreateDatabaseDialog: FC<ActionDialogProps> = ({
  resolve: { resource, refetch },
}) => {
  const dispatch = useDispatch();
  return (
    <ResourceActionDialog
      dialogTitle={translate('Create SQL database in PostgreSQL server')}
      formFields={[createNameField(), createDescriptionField()]}
      submitForm={async (formData) => {
        try {
          await createDatabase(resource.uuid, formData);
          dispatch(showSuccess(translate('SQL database has been created.')));
          dispatch(closeModalDialog());
          if (refetch) {
            await refetch();
          }
        } catch (e) {
          dispatch(
            showErrorResponse(e, translate('Unable to create SQL database.')),
          );
        }
      }}
    />
  );
};
