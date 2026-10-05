import { PlusCircleIcon } from '@phosphor-icons/react';
import { useRouter } from '@uirouter/react';
import { FunctionComponent } from 'react';

import { BaseButton } from 'waldur-ui';

import { lazyComponent } from '@/core/lazyComponent';
import { isFeatureVisible } from '@/features/connect';
import { CustomerFeatures } from '@/FeaturesEnums';
import { translate } from '@/i18n/translate';
import { useModal } from '@/modal/actions';
import { ActionItem } from '@/resource/actions/ActionItem';
import { ActionsMenu } from '@/table/ActionsDropdown';
import { useUser } from '@/workspace/hooks';

const CustomerCreateDialog = lazyComponent(() =>
  import('@/customer/create/CustomerCreateDialog').then((module) => ({
    default: module.CustomerCreateDialog,
  })),
);

export const OrganizationCreateButton: FunctionComponent = () => {
  const user = useUser();
  const { openDialog } = useModal();
  const router = useRouter();
  const showOnboarding = isFeatureVisible(CustomerFeatures.show_onboarding);

  if (!user.is_staff && !showOnboarding) return null;

  if (user.is_staff && showOnboarding) {
    return (
      <ActionsMenu side="bottom" toggle="add" size="lg" align="start">
        <ActionItem
          title={translate('Create organisation')}
          action={() =>
            openDialog(CustomerCreateDialog, {
              resolve: { role: 'CUSTOMER' },
            })
          }
        />
        <ActionItem
          title={translate('Onboard organisation')}
          action={() => router.stateService.go('organizations-create')}
        />
      </ActionsMenu>
    );
  }

  return (
    <BaseButton
      label={translate('Add')}
      onClick={() =>
        user.is_staff
          ? openDialog(CustomerCreateDialog, { resolve: { role: 'CUSTOMER' } })
          : router.stateService.go('organizations-create')
      }
      iconNode={<PlusCircleIcon weight="bold" />}
      variant="primary"
      size="lg"
    />
  );
};
