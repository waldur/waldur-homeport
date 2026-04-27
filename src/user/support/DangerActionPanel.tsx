import { TrashIcon } from '@phosphor-icons/react';
import { FC, useState } from 'react';
import { Form } from 'react-bootstrap';
import { useDispatch } from 'react-redux';

import { lazyComponent } from '@/core/lazyComponent';
import { Panel } from '@/core/Panel';
import { translate } from '@/i18n';
import { openModalDialog } from '@/modal/actions';
import { ActionButton } from '@/table/ActionButton';

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
        <ActionButton
          variant="danger"
          action={() => dispatch(openModalDialog(DangerActionDialog, props))}
          disabled={!confirm}
          disabledReason={translate('Please confirm before proceeding')}
          iconNode={<TrashIcon weight="bold" />}
          title={props.buttonTitle}
        />
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
