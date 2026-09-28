import { PlusCircleIcon } from '@phosphor-icons/react';

import { BaseButton } from 'waldur-ui';

import { translate } from '@/i18n';

interface DataVolumeAddButtonProps {
  onClick(): void;
}

export const DataVolumeAddButton = (props: DataVolumeAddButtonProps) => (
  <BaseButton
    onClick={props.onClick}
    label={translate('Add data volume')}
    iconNode={<PlusCircleIcon weight="bold" />}
    variant="tertiary"
    size="lg"
  />
);
