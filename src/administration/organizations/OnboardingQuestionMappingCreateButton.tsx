import { FC } from 'react';

import { CreateModalButton } from '@waldur/core/buttons';
import { lazyComponent } from '@waldur/core/lazyComponent';

interface OnboardingQuestionMetadataTableActionsProps {
  refetch: () => void;
}

const OnboardingQuestionMappingFormDialog = lazyComponent(() =>
  import('@waldur/administration/organizations/OnboardingQuestionMappingFormDialog').then(
    (module) => ({
      default: module.OnboardingQuestionMappingFormDialog,
    }),
  ),
);

export const OnboardingQuestionMappingCreateButton: FC<
  OnboardingQuestionMetadataTableActionsProps
> = ({ refetch }) => (
  <CreateModalButton
    dialog={OnboardingQuestionMappingFormDialog}
    resolve={{ refetch }}
    size="lg"
  />
);
