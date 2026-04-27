import { KeyIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import { useDispatch } from 'react-redux';
import { PublicOfferingDetails, Resource } from 'waldur-js-client';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { openModalDialog } from '@/modal/actions';
import { ActionItem } from '@/resource/actions/ActionItem';

const AddKeycloakMembershipDialog = lazyComponent(() =>
  import('./AddKeycloakMembershipDialog').then((module) => ({
    default: module.AddKeycloakMembershipDialog,
  })),
);

interface AddKeycloakMembershipButtonProps {
  resource: Resource;
  offering: PublicOfferingDetails;
  refetch(): void;
}

export const AddKeycloakMembershipButton: FC<
  AddKeycloakMembershipButtonProps
> = ({ resource, offering, refetch }) => {
  const dispatch = useDispatch();

  return (
    <ActionItem
      title={translate('Resource access')}
      action={() =>
        dispatch(
          openModalDialog(AddKeycloakMembershipDialog, {
            resolve: { resource, offering, refetch },
            size: 'lg',
          }),
        )
      }
      iconNode={<KeyIcon weight="bold" />}
    />
  );
};
