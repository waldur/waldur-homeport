import { openModalDialog } from '@waldur/modal/actions';

export const showAttributeFilter = () =>
  openModalDialog('marketplaceAttributeFilterListDialog', {size: 'sm'});
