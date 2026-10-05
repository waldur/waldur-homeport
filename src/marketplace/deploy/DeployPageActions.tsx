import { DotsThreeVerticalIcon } from '@phosphor-icons/react';
import { forwardRef } from 'react';

import { BaseButton } from 'waldur-ui';

import { translate } from '@/i18n';
import { ActionItem } from '@/resource/actions/ActionItem';
import { ActionsMenu } from '@/table/ActionsDropdown';

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
    <ActionsMenu side="bottom" toggle={<DeployPageActionsToggle />} align="end">
      <ActionItem action={() => null} title={translate('Import config')} />
      <ActionItem action={() => null} title={translate('Edit as YAML')} />
      <ActionItem
        action={() => null}
        title={translate('Order with script over API')}
      />
    </ActionsMenu>
  );
};
