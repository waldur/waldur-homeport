import { FC } from 'react';

import { CreateModalButton } from '@waldur/core/buttons';
import { lazyComponent } from '@waldur/core/lazyComponent';

interface OnboardingCountryConfigCreateButtonProps {
  refetch: () => void;
}

const OnboardingCountryConfigFormDialog = lazyComponent(() =>
  import('@waldur/administration/organizations/OnboardingCountryConfigFormDialog').then(
    (module) => ({
      default: module.OnboardingCountryConfigFormDialog,
    }),
  ),
);

export const OnboardingCountryConfigCreateButton: FC<
  OnboardingCountryConfigCreateButtonProps
> = ({ refetch }) => (
  <CreateModalButton
    dialog={OnboardingCountryConfigFormDialog}
    resolve={{ refetch }}
    size="lg"
  />
);
