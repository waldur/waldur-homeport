import { lazyComponent } from '@waldur/core/lazyComponent';
import { openModalDialog } from '@waldur/modal/actions';

const UserPopover = lazyComponent(
  () =>
    import(/* webpackChunkName: "UserPopover" */ '@waldur/user/UserPopover'),
  'UserPopover',
);

export const openUserPopover = (resolve) =>
  openModalDialog(UserPopover, { resolve });
