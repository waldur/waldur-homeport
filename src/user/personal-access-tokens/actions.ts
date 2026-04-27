import { lazyComponent } from '@/core/lazyComponent';
import { openModalDialog } from '@/modal/actions';

const PersonalAccessTokenCreateDialog = lazyComponent(() =>
  import('./PersonalAccessTokenCreateDialog').then((module) => ({
    default: module.PersonalAccessTokenCreateDialog,
  })),
);

export const personalAccessTokenCreateDialog = (refetch?) =>
  openModalDialog(PersonalAccessTokenCreateDialog, {
    size: 'lg',
    resolve: { refetch },
  });
