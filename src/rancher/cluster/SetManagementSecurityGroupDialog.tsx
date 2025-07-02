import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { formValueSelector } from 'redux-form';
import { rancherClustersCreateManagementSecurityGroup } from 'waldur-js-client';

import { translate } from '@waldur/i18n';
import { closeModalDialog } from '@waldur/modal/actions';
import {
  getCIDRPlaceholder,
  validateIPv4CIDR,
  validateIPv6CIDR,
} from '@waldur/openstack/openstack-security-groups/rule-editor/CIDRField';
import { RESOURCE_ACTION_FORM } from '@waldur/resource/actions/constants';
import { ResourceActionDialog } from '@waldur/resource/actions/ResourceActionDialog';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';
import { RootState } from '@waldur/store/reducers';

const selector = formValueSelector(RESOURCE_ACTION_FORM);

const ethertypeSelector = (state: RootState) => selector(state, 'ethertype');

export const SetManagementSecurityGroupDialog = ({ clusterId }) => {
  const ethertype = useSelector(ethertypeSelector);
  const dispatch = useDispatch();

  const submitForm = useCallback(
    async (formData) => {
      try {
        await rancherClustersCreateManagementSecurityGroup({
          path: { uuid: clusterId },
          body: formData,
        });
        dispatch(
          showSuccess(translate('Management security group has been updated.')),
        );
        dispatch(closeModalDialog());
      } catch (e) {
        dispatch(
          showErrorResponse(
            e,
            translate('Unable to update management security group.'),
          ),
        );
      }
    },
    [dispatch],
  );

  return (
    <ResourceActionDialog
      dialogTitle={translate('Set management security group')}
      submitForm={submitForm}
      formFields={[
        {
          name: 'ethertype',
          type: 'select',
          label: translate('Ethernet type'),
          options: [
            { value: 'IPv4', label: translate('IPv4') },
            { value: 'IPv6', label: translate('IPv6') },
          ],

          required: true,
        },
        {
          name: 'cidr',
          type: 'string',
          label: translate('CIDR'),
          placeholder: getCIDRPlaceholder(ethertype),
          validate: ethertype === 'IPv4' ? validateIPv4CIDR : validateIPv6CIDR,
          required: true,
        },
      ]}
    />
  );
};
