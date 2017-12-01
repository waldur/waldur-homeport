import * as React from 'react';
import { EventGroup } from './types';
import './TypeListDialog.scss';
import { TranslateProps } from '@waldur/i18n/types';

type Props = (TranslateProps & {
  types: EventGroup[];
  dialogTitle: string;
  dismiss(): void;
});

const TypeListDialog = (props: Props) => {
  return (
    <div>
      <div className="modal-header">
        <h3 className="modal-title">{props.dialogTitle}</h3>
      </div>
      <div className="modal-body types-list-dialog">
        {props.types.map((type, i) => (
          <div key={i}>
            <b className={'icon ' + type.icon}></b>
            <span className="left-padding">{type.name}</span>
            <ul>
              {type.descriptions.map((description, i) => (
                <li key={i}>{description}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="modal-footer">
        <button className="btn btn-default" onClick={props.dismiss}>
          {props.translate('Cancel')}
        </button>
      </div>
    </div>
  );
};

export { TypeListDialog };
