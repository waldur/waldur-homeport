import * as React from 'react';

import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { ModalDialog } from '@waldur/modal/ModalDialog';

import './TypeListDialog.scss';
import { EventGroup } from './types';

interface TypeListDialogProps {
  types: EventGroup[];
  dialogTitle: string;
}

export const TypeListDialog = (props: TypeListDialogProps) => (
  <ModalDialog
    title={props.dialogTitle}
    bodyClassName="types-list-dialog"
    footer={<CloseDialogButton />}
  >
    {props.types.map((type, i) => (
      <div key={i}>
        <span className="left-padding">{type.title}</span>
        <ul>
          {type.events.map((event, j) => (
            <li key={j}>{event.title}</li>
          ))}
        </ul>
      </div>
    ))}
  </ModalDialog>
);
