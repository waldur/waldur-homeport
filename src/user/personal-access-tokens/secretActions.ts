import { lazyComponent } from '@/core/lazyComponent';
import { openModalDialog } from '@/modal/actions';

const PersonalAccessTokenSecretDialog = lazyComponent(() =>
  import('./PersonalAccessTokenSecretDialog').then((module) => ({
    default: module.PersonalAccessTokenSecretDialog,
  })),
);

export const personalAccessTokenSecretDialog = (
  token: string,
  tokenName: string,
) =>
  openModalDialog(PersonalAccessTokenSecretDialog, {
    size: 'lg',
    resolve: { token, tokenName },
  });
