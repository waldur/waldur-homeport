import { openModalDialog } from '@waldur/modal/actions';

export const showUserDetails = user => openModalDialog('UserDetailsDialog', {resolve: { user }, size: 'lg'});
