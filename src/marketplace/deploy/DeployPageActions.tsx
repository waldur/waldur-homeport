import { DotsThreeVerticalIcon } from '@phosphor-icons/react';
import * as RadixDropdownMenu from '@radix-ui/react-dropdown-menu';
import { forwardRef } from 'react';

import { translate } from '@/i18n';
import { ActionItem } from '@/resource/actions/ActionItem';

/**
 * forwardRef for the asChild Trigger below — see ActionsDropdown.tsx's
 * TableDropdownToggle for the general requirement. Reproduces the exact
 * classes react-bootstrap's `Dropdown.Toggle variant="light"
 * bsPrefix="btn-icon bg-body"` rendered — empirically confirmed via RTL
 * (`btn-icon bg-body btn btn-light`, with no `dropdown-toggle` class:
 * overriding `bsPrefix` replaces DropdownToggle's own base class entirely,
 * and Button never receives that bsPrefix so it applies its own default
 * "btn" prefix independently), not reconstructed from reading the
 * component source alone.
 */
const DeployPageActionsToggle = forwardRef<HTMLButtonElement>((props, ref) => (
  <button
    ref={ref}
    type="button"
    className="btn-icon bg-body btn btn-light"
    {...props}
  >
    <DotsThreeVerticalIcon weight="bold" />
  </button>
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
