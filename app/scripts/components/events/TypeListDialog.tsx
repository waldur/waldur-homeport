import * as React from 'react';

import { TranslateProps, withTranslation } from '@waldur/i18n';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { ModalDialog } from '@waldur/modal/ModalDialog';

import './TypeListDialog.scss';
import { EventGroup } from './types';

interface Props extends TranslateProps {
  types: EventGroup[];
  dialogTitle: string;
}

const PureTypeListDialog = (props: Props) => (
  <ModalDialog title={props.dialogTitle} bodyClassName="types-list-dialog" footer={<CloseDialogButton/>}>
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

export const TypeListDialog = withTranslation(PureTypeListDialog);
