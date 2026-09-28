import { ListIcon, GridFourIcon } from '@phosphor-icons/react';

import { BaseButton } from 'waldur-ui';

import { translate } from '@/i18n';

import { TableProps } from './types';

export const TableDisplayModeButton = (
  props: Pick<TableProps, 'mode' | 'setDisplayMode'>,
) => {
  return (
    <BaseButton
      variant="tertiary"
      size="lg"
      tooltip={
        props.mode === 'grid' ? translate('Table mode') : translate('Grid mode')
      }
      iconNode={
        props.mode === 'grid' ? (
          <ListIcon weight="bold" />
        ) : (
          <GridFourIcon weight="bold" />
        )
      }
      onClick={() =>
        props.setDisplayMode(props.mode === 'grid' ? 'table' : 'grid')
      }
      className="btn-toggle-mode"
    />
  );
};
