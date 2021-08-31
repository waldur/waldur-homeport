import { useRouter } from '@uirouter/react';

import { ENV } from '@waldur/configs/default';

export const useSupport = () => {
  const router = useRouter();
  if (!ENV.plugins.WALDUR_SUPPORT.ENABLED) {
    router.stateService.go('errorPage.notFound');
  }
};
