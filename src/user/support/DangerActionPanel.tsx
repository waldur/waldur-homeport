import { FC, useState } from 'react';
import { Form } from 'react-bootstrap';

import { lazyComponent } from '@/core/lazyComponent';
import { Panel } from '@/core/Panel';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { RemovalActionButton } from '@/table/RemovalActionButton';

import { DangerActionPanelProps } from './DangerActionPanelProps';

const DangerActionDialog = lazyComponent(() =>
  import('./DangerActionDialog').then((module) => ({
    default: module.DangerActionDialog,
  })),
);

export const DangerActionPanel: FC<DangerActionPanelProps> = (props) => {
  const { openDialog } = useModal();
  const [confirm, setConfirm] = useState(false);

  return (
    <Panel
      title={props.panelTitle}
      cardBordered
      actions={
        <RemovalActionButton
          action={() => openDialog(DangerActionDialog, props)}
          disabled={!confirm}
          disabledReason={translate('Please confirm before proceeding')}
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
