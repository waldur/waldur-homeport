import { DotsThreeVerticalIcon } from '@phosphor-icons/react';
import * as RadixDropdownMenu from '@radix-ui/react-dropdown-menu';
import { forwardRef } from 'react';

import { BaseButton } from 'waldur-ui';

import { translate } from '@/i18n';
import { ActionItem } from '@/resource/actions/ActionItem';

/** forwardRef for the asChild Trigger below — see ActionsDropdown.tsx's TableDropdownToggle for the general requirement. */
const DeployPageActionsToggle = forwardRef<HTMLButtonElement>((props, ref) => (
  <BaseButton
    ref={ref}
    variant="tertiary"
    tooltip={translate('Actions')}
    iconNode={<DotsThreeVerticalIcon weight="bold" />}
    {...props}
  />
));
DeployPageActionsToggle.displayName = 'DeployPageActionsToggle';

export const DeployPageActions = () => {
  return (
    <RadixDropdownMenu.Root modal={false}>
      <RadixDropdownMenu.Trigger asChild>
        <DeployPageActionsToggle />
      </RadixDropdownMenu.Trigger>
      <RadixDropdownMenu.Portal>
        <RadixDropdownMenu.Content
          align="end"
          sideOffset={2}
          className="dropdown-menu show position-static"
        >
          <ActionItem action={() => null} title={translate('Import config')} />
          <ActionItem action={() => null} title={translate('Edit as YAML')} />
          <ActionItem
            action={() => null}
            title={translate('Order with script over API')}
          />
        </RadixDropdownMenu.Content>
      </RadixDropdownMenu.Portal>
    </RadixDropdownMenu.Root>
  );
};
