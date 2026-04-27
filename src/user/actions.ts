import { lazyComponent } from '@/core/lazyComponent';
import { openModalDialog } from '@/modal/actions';

const UserPopover = lazyComponent(() =>
  import('@/user/UserPopover').then((module) => ({
    default: module.UserPopover,
  })),
);

export const openUserPopover = (resolve) =>
  openModalDialog(UserPopover, { resolve, size: 'lg' });
