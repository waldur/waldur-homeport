import { ListIcon, GridFourIcon } from '@phosphor-icons/react';
import { Button } from 'react-bootstrap';

import { Tip } from '@waldur/core/Tooltip';
import { translate } from '@waldur/i18n';

import { TableProps } from './types';

export const TableDisplayModeButton = (
  props: Pick<TableProps, 'mode' | 'setDisplayMode'>,
) => {
  return (
    <Tip
      id="table-mode-toggle-tip"
      label={
        props.mode === 'grid' ? translate('Table mode') : translate('Grid mode')
      }
    >
      <Button
        variant="outline-default"
        className="btn-outline btn-icon btn-toggle-mode"
        size="lg"
        onClick={() =>
          props.setDisplayMode(props.mode === 'grid' ? 'table' : 'grid')
        }
      >
        <span className="svg-icon svg-icon-2">
          {props.mode === 'grid' ? (
            <ListIcon weight="bold" />
          ) : (
            <GridFourIcon weight="bold" />
          )}
        </span>
      </Button>
    </Tip>
  );
};
