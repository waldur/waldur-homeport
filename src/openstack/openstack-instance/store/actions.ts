import { openModalDialog } from '@waldur/modal/actions';
import { SecurityGroup } from '@waldur/openstack/openstack-security-groups/types';

export const openSecurityGroupsDetailsDialog = (securityGroups: SecurityGroup[]) =>
  openModalDialog('SecurityGroupsDialogReact', {resolve: { securityGroups }, size: 'lg'});
