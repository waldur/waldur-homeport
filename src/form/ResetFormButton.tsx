import { connect } from 'react-redux';
import { compose } from 'redux';
import { reset } from 'redux-form';

import { TranslateProps, withTranslation } from '@waldur/i18n';

interface ResetFormButtonProps extends TranslateProps {
  label?: string;
  resetForm(): void;
  className?: string;
}

const PureResetFormButton = ({
  resetForm,
  label,
  className,
  translate,
}: ResetFormButtonProps) => (
  <button
    type="button"
    className={className || 'btn btn-danger'}
    onClick={resetForm}
  >
    <>{label || translate('Reset')}</>
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
