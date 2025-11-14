import { FC } from 'react';
import { useDispatch } from 'react-redux';

import { AddButton } from '@waldur/core/AddButton';
import { lazyComponent } from '@waldur/core/lazyComponent';
import { openModalDialog } from '@waldur/modal/actions';

interface OnboardingCountryConfigCreateButtonProps {
  refetch: () => void;
}

const OnboardingCountryConfigFormDialog = lazyComponent(() =>
  import(
    '@waldur/administration/organizations/OnboardingCountryConfigFormDialog'
  ).then((module) => ({
    default: module.OnboardingCountryConfigFormDialog,
  })),
);

export const OnboardingCountryConfigCreateButton: FC<
  OnboardingCountryConfigCreateButtonProps
> = ({ refetch }) => {
  const dispatch = useDispatch();

  const createConfig = () => {
    dispatch(
      openModalDialog(OnboardingCountryConfigFormDialog, {
        resolve: { refetch },
        size: 'lg',
      }),
    );
  };

  return <AddButton action={createConfig} />;
};
