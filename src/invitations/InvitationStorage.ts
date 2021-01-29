import { getItem, removeItem, setItem } from '@waldur/auth/AuthStorage';

const key = 'ncInvitationToken';

export const setInvitationToken = (value: string) => setItem(key, value);

export const getInvitationToken = () => getItem(key);

export const clearInvitationToken = () => removeItem(key);
