import * as React from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';

import { TranslateProps, withTranslation } from '@waldur/i18n';
import { closeModalDialog } from '@waldur/modal/actions';

interface Props extends TranslateProps {
  dismiss(): void;
  label?: string;
}

const PureCloseDialogButton = ({ translate, dismiss, label }: Props) => (
  <button
    type="button"
    className="btn btn-default"
    onClick={dismiss}>
    <span>{label || translate('Cancel')}</span>
  </button>
);

const mapDispatchToProps = dispatch => ({
  dismiss: () => dispatch(closeModalDialog()),
});

const enhance = compose(withTranslation, connect(undefined, mapDispatchToProps));

export const CloseDialogButton = enhance(PureCloseDialogButton);
