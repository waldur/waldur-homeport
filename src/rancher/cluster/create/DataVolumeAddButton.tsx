import { PlusCircleIcon } from '@phosphor-icons/react';

import { translate } from '@waldur/i18n';
import { ActionButton } from '@waldur/table/ActionButton';

interface DataVolumeAddButtonProps {
  onClick(): void;
}

export const DataVolumeAddButton = (props: DataVolumeAddButtonProps) => (
  <ActionButton
    action={props.onClick}
    title={translate('Add data volume')}
    iconNode={<PlusCircleIcon weight="bold" />}
  />
);
