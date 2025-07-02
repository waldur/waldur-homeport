import { TrashIcon } from '@phosphor-icons/react';
import { FC, useState } from 'react';
import { Button, Form } from 'react-bootstrap';
import { useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { Panel } from '@waldur/core/Panel';
import { openModalDialog } from '@waldur/modal/actions';

import { DangerActionPanelProps } from './DangerActionPanelProps';

const DangerActionDialog = lazyComponent(() =>
  import('./DangerActionDialog').then((module) => ({
    default: module.DangerActionDialog,
  })),
);

export const DangerActionPanel: FC<DangerActionPanelProps> = (props) => {
  const dispatch = useDispatch();
  const [confirm, setConfirm] = useState(false);

  return (
    <Panel
      title={props.panelTitle}
      cardBordered
      actions={
        <Button
          variant="light-danger"
          onClick={() => dispatch(openModalDialog(DangerActionDialog, props))}
          disabled={!confirm}
        >
          <span className="svg-icon svg-icon-2">
            <TrashIcon weight="bold" />
          </span>
          {props.buttonTitle}
        </Button>
      }
    >
      {props.panelDescription}
      <Form.Check
        id="confirm-deletion"
        type="checkbox"
        checked={confirm}
        onChange={(value) => setConfirm(value.target.checked)}
        label={props.checkboxLabel}
      />
    </Panel>
  );
};
