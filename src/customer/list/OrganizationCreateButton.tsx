import { PlusCircleIcon } from '@phosphor-icons/react';
import * as RadixDropdownMenu from '@radix-ui/react-dropdown-menu';
import { useRouter } from '@uirouter/react';
import { FunctionComponent } from 'react';

import { lazyComponent } from '@/core/lazyComponent';
import { isFeatureVisible } from '@/features/connect';
import { CustomerFeatures } from '@/FeaturesEnums';
import { translate } from '@/i18n/translate';
import { useModal } from '@/modal/actions';
import { ActionItem } from '@/resource/actions/ActionItem';
import { ActionButton } from '@/table/ActionButton';
import { AddDropdownToggle } from '@/table/ActionsDropdown';
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
      <RadixDropdownMenu.Root modal={false}>
        <RadixDropdownMenu.Trigger asChild>
          <AddDropdownToggle size="lg" />
        </RadixDropdownMenu.Trigger>
        <RadixDropdownMenu.Portal>
          <RadixDropdownMenu.Content
            align="start"
            sideOffset={2}
            className="dropdown-menu show position-static"
          >
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
          </RadixDropdownMenu.Content>
        </RadixDropdownMenu.Portal>
      </RadixDropdownMenu.Root>
    );
  }

  return (
    <ActionButton
      title={translate('Add')}
      action={() =>
        user.is_staff
          ? openDialog(CustomerCreateDialog, { resolve: { role: 'CUSTOMER' } })
          : router.stateService.go('organizations-create')
      }
      iconNode={<PlusCircleIcon weight="bold" />}
      variant="primary"
    />
  );
};
