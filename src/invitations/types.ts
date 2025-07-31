import { RoleType } from '@waldur/permissions/types';
export { Invitation } from 'waldur-js-client';

export interface GenericInvitationContext {
  scope?: {
    manager_uuid?: string;
    url: string;
    uuid: string;
  };
  roleTypes?: RoleType[];
  roles?: string[];
}
