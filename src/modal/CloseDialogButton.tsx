import * as React from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';

import { TranslateProps, withTranslation } from '@waldur/i18n';
import { closeModalDialog } from '@waldur/modal/actions';

interface OwnProps {
  label?: string;
  className?: string;
}

interface DispatchProps {
  dismiss(): void;
}

type Props = TranslateProps & OwnProps & DispatchProps;

const PureCloseDialogButton = ({ translate, dismiss, label, className }: Props) => (
  <button
    type="button"
    className={className || 'btn btn-default'}
    onClick={dismiss}>
    <span>{label || translate('Cancel')}</span>
  </button>
);

const mapDispatchToProps = dispatch => ({
  dismiss: () => dispatch(closeModalDialog()),
});

const enhance = compose(connect<{}, DispatchProps, OwnProps>(undefined, mapDispatchToProps), withTranslation);

export const CloseDialogButton = enhance(PureCloseDialogButton);
