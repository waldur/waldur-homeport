import * as React from 'react';
import { connect } from 'react-redux';

import { TranslateProps, withTranslation } from '@waldur/i18n';
import { closeModalDialog } from '@waldur/modal/actions';
import { ModalDialog } from '@waldur/modal/ModalDialog';

import './TypeListDialog.scss';
import { EventGroup } from './types';

interface Props extends TranslateProps {
  types: EventGroup[];
  dialogTitle: string;
  dismiss(): void;
}

const PureTypeListDialog = (props: Props) => {
  const footer = (
    <button className="btn btn-default" onClick={props.dismiss}>
      {props.translate('Cancel')}
    </button>
  );
  return (
    <ModalDialog title={props.dialogTitle} bodyClassName="types-list-dialog" footer={footer}>
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
    </ModalDialog>
  );
};

const mapDispatchToProps = dispatch => ({
  dismiss: () => dispatch(closeModalDialog()),
});

export const TypeListDialog = withTranslation(connect(undefined, mapDispatchToProps)(PureTypeListDialog));
