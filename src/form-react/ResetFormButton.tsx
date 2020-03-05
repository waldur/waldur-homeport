import * as React from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { reset } from 'redux-form';

import { TranslateProps, withTranslation } from '@waldur/i18n';

interface Props extends TranslateProps {
  label?: string;
  resetForm(): void;
  className?: string;
}

const PureResetFormButton = ({
  resetForm,
  label,
  className,
  translate,
}: Props) => (
  <button
    type="button"
    className={className || 'btn btn-danger'}
    onClick={resetForm}
  >
    <span>{label || translate('Reset')}</span>
  </button>
);

const mapDispatchToProps = (dispatch, props) => ({
  resetForm: () => dispatch(reset(props.formName)),
});

const enhance = compose(
  connect(undefined, mapDispatchToProps),
  withTranslation,
);

export const ResetFormButton = enhance(PureResetFormButton);
