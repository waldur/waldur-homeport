import { useSelector } from 'react-redux';
import { formValueSelector } from 'redux-form';
import {
  RancherClusterRequest,
  rancherClustersCreateManagementSecurityGroup,
} from 'waldur-js-client';

import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import {
  getCIDRPlaceholder,
  validateIPv4CIDR,
  validateIPv6CIDR,
} from '@/openstack/openstack-security-groups/rule-editor/CIDRField';
import { RESOURCE_ACTION_FORM } from '@/resource/actions/constants';
import { ResourceActionDialog } from '@/resource/actions/ResourceActionDialog';
import { RootState } from '@/store/reducers';

const selector = formValueSelector(RESOURCE_ACTION_FORM);

const ethertypeSelector = (state: RootState) => selector(state, 'ethertype');

export const SetManagementSecurityGroupDialog = ({ clusterId }) => {
  const ethertype = useSelector(ethertypeSelector);
  const submitFormMutation = useManagedMutation<
    any,
    any,
    RancherClusterRequest
  >({
    mutationFn: (formData) =>
      rancherClustersCreateManagementSecurityGroup({
        path: { uuid: clusterId },
        body: formData,
      }),
    successMessage: translate('Management security group has been updated.'),
    errorMessage: translate('Unable to update management security group.'),
  });

  return (
    <ResourceActionDialog
      dialogTitle={translate('Set management security group')}
      submitForm={(values) => submitFormMutation.mutateAsync(values)}
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
