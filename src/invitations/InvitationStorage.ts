import { getItem, removeItem, setItem } from '@waldur/auth/AuthStorage';

const keyInvitation = 'waldur/invitation/token';
const keyGroupInvitation = 'waldur/group-invitation/token';

export const setInvitationToken = (value: string) =>
  setItem(keyInvitation, value);

export const getInvitationToken = () => getItem(keyInvitation);

export const clearInvitationToken = () => removeItem(keyInvitation);

export const setGroupInvitationToken = (value: string) =>
  setItem(keyGroupInvitation, value);

export const getGroupInvitationToken = () => getItem(keyGroupInvitation);

export const clearGroupInvitationToken = () => removeItem(keyGroupInvitation);
