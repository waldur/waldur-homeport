import { useMemo } from 'react';
import { useDispatch } from 'react-redux';
import { useAsync } from 'react-use';
import { reduxForm } from 'redux-form';

import { translate } from '@waldur/i18n';
import { closeModalDialog } from '@waldur/modal/actions';
import {
  loadSecurityGroups,
  updateSecurityGroups,
} from '@waldur/openstack/api';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';

import { OpenStackInstance } from '../../types';

interface UpdateSecurityGroupsFormData {
  security_groups: { value: string; label: string }[];
}

export const useUpdateSecurityGroupsForm = (resource: OpenStackInstance) => {
  const asyncState = useAsync(
    () =>
      loadSecurityGroups(resource.service_settings_uuid).then((groups) =>
        groups.map((group) => ({
          label: group.name,
          value: group.url,
        })),
      ),
    [resource.service_settings_uuid],
  );
  const dispatch = useDispatch();
  const submitRequest = async (formData: UpdateSecurityGroupsFormData) => {
    try {
      await updateSecurityGroups(resource.uuid, {
        security_groups: formData.security_groups.map((item) => ({
          url: item.value,
        })),
      });
      dispatch(
        showSuccess(
          translate(
            'Update of OpenStack instance security groups has been scheduled.',
          ),
        ),
      );
      dispatch(closeModalDialog());
    } catch (e) {
      dispatch(
        showErrorResponse(
          e,
          translate('Unable to update security groups of OpenStack instance.'),
        ),
      );
    }
  };
  const initialValues = useMemo<UpdateSecurityGroupsFormData>(
    () => ({
      security_groups: resource.security_groups.map((group) => ({
        label: group.name,
        value: group.url,
      })),
    }),
    [resource.security_groups],
  );
  return { resource, asyncState, submitRequest, initialValues };
};

const FORM_NAME = 'UpdateSecurityGroups';

type UpdateSecurityGroupsOwnProps = ReturnType<
  typeof useUpdateSecurityGroupsForm
>;

export const connectForm = reduxForm<
  UpdateSecurityGroupsFormData,
  UpdateSecurityGroupsOwnProps
>({
  form: FORM_NAME,
});
