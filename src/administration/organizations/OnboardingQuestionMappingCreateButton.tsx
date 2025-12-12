import { FC } from 'react';
import { useDispatch } from 'react-redux';

import { AddButton } from '@waldur/core/AddButton';
import { lazyComponent } from '@waldur/core/lazyComponent';
import { openModalDialog } from '@waldur/modal/actions';

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
> = ({ refetch }) => {
  const dispatch = useDispatch();

  const createMapping = () => {
    dispatch(
      openModalDialog(OnboardingQuestionMappingFormDialog, {
        resolve: { refetch },
        size: 'lg',
      }),
    );
  };

  return <AddButton action={createMapping} />;
};
