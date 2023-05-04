import { FC } from 'react';
import { useDispatch } from 'react-redux';

import { translate } from '@waldur/i18n';
import { closeModalDialog } from '@waldur/modal/actions';
import { showSuccess, showErrorResponse } from '@waldur/store/notify';

import { Resource } from '../types';

import { ResourceActionDialog } from './ResourceActionDialog';
import { ActionValidator } from './types';

interface UpdateResourceDialogProps {
  fields?: any[];
  validators?: ActionValidator<Resource>[];
  updateResource(id: string, formData: any): Promise<any>;
  verboseName: string;
  resource: Resource;
  refetch?(): void;
  initialValues: any;
}

export const UpdateResourceDialog: FC<UpdateResourceDialogProps> = ({
  resource,
  refetch,
  updateResource,
  verboseName,
  fields,
  initialValues,
}) => {
  const dispatch = useDispatch();
  return (
    <ResourceActionDialog
      submitForm={async (formData) => {
        try {
          await updateResource(resource.uuid, formData);
          dispatch(
            showSuccess(
              translate('{verboseName} has been updated.', { verboseName }),
            ),
          );
          if (refetch) {
            await refetch();
          }
          dispatch(closeModalDialog());
        } catch (e) {
          dispatch(
            showErrorResponse(
              e,
              translate('Unable to update {verboseName}.', {
                verboseName,
              }),
            ),
          );
        }
      }}
      dialogTitle={
        resource.name
          ? translate('Update {resourceType} {resourceName}', {
              resourceType: verboseName,
              resourceName: resource.name,
            })
          : translate('Update {resourceType}', {
              resourceType: verboseName,
            })
      }
      formFields={fields}
      initialValues={initialValues}
    />
  );
};
