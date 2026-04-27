import { ListIcon, GridFourIcon } from '@phosphor-icons/react';

import { translate } from '@/i18n';

import { ToolbarButton } from './ToolbarButton';
import { TableProps } from './types';

export const TableDisplayModeButton = (
  props: Pick<TableProps, 'mode' | 'setDisplayMode'>,
) => {
  return (
    <ToolbarButton
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
