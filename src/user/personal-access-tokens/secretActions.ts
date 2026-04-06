import { lazyComponent } from '@waldur/core/lazyComponent';
import { openModalDialog } from '@waldur/modal/actions';

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
