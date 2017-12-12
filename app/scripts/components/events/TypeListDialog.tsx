import * as React from 'react';
import { connect } from 'react-redux';

import { TranslateProps, withTranslation } from '@waldur/i18n';
import { closeModalDialog } from '@waldur/modal/actions';

import './TypeListDialog.scss';
import { EventGroup } from './types';

type Props = TranslateProps & {
  types: EventGroup[];
  dialogTitle: string;
  dismiss(): void;
};

const PureTypeListDialog = (props: Props) => (
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
            {type.descriptions.map((description, j) => (
              <li key={j}>{description}</li>
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

const mapDispatchToProps = dispatch => ({
  dismiss: () => dispatch(closeModalDialog()),
});

export const TypeListDialog = withTranslation(connect(undefined, mapDispatchToProps)(PureTypeListDialog));
