import { useDispatch } from 'react-redux';
import { useAsync } from 'react-use';
import { reduxForm } from 'redux-form';

import { translate } from '@waldur/i18n';
import { closeModalDialog } from '@waldur/modal/actions';
import {
  loadSecurityGroupsResources,
  createSecurityGroup,
  CreateSecurityGroupRequestBody,
} from '@waldur/openstack/api';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';

import { OpenStackTenant } from '../types';

type CreateSecurityGroupFormData = CreateSecurityGroupRequestBody;

export const useCreateSecurityGroupForm = (resource: OpenStackTenant) => {
  const asyncState = useAsync(
    () =>
      loadSecurityGroupsResources({
        tenant: resource.url,
        field: ['name', 'url'],
        o: 'name',
      }),
    [resource.url],
  );
  const dispatch = useDispatch();
  const submitRequest = async (formData: CreateSecurityGroupFormData) => {
    try {
      await createSecurityGroup(resource.uuid, {
        ...formData,
        rules:
          formData.rules === undefined
            ? []
            : formData.rules.map((rule) => ({
                ...rule,
                protocol: rule.protocol === null ? '' : rule.protocol,
              })),
      });
      dispatch(
        showSuccess(translate('Security group creation has been scheduled.')),
      );
      dispatch(closeModalDialog());
    } catch (e) {
      dispatch(
        showErrorResponse(e, translate('Unable to create security group.')),
      );
    }
  };
  return { asyncState, submitRequest, resource };
};

const FORM_NAME = 'CreateSecurityGroupForm';

type OwnProps = ReturnType<typeof useCreateSecurityGroupForm>;

export const connectForm = reduxForm<CreateSecurityGroupFormData, OwnProps>({
  form: FORM_NAME,
});
