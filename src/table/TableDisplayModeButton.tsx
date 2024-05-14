import { List, GridFour } from '@phosphor-icons/react';
import { Button } from 'react-bootstrap';

import { Tip } from '@waldur/core/Tooltip';
import { translate } from '@waldur/i18n';

import { TableProps } from './Table';

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
        variant="light"
        className="btn-icon btn-toggle-mode"
        onClick={() =>
          props.setDisplayMode(props.mode === 'grid' ? 'table' : 'grid')
        }
      >
        <span className="svg-icon svg-icon-2">
          {props.mode === 'grid' ? <List /> : <GridFour />}
        </span>
      </Button>
    </Tip>
  );
};
