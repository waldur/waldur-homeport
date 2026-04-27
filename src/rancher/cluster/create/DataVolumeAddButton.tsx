import { PlusCircleIcon } from '@phosphor-icons/react';

import { translate } from '@/i18n';
import { ActionButton } from '@/table/ActionButton';

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
