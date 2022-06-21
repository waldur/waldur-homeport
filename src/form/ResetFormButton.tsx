import { connect } from 'react-redux';
import { reset } from 'redux-form';

import { translate } from '@waldur/i18n';

interface ResetFormButtonProps {
  label?: string;
  resetForm(): void;
  className?: string;
}

const PureResetFormButton = ({
  resetForm,
  label,
  className,
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

const enhance = connect(undefined, mapDispatchToProps);

export const ResetFormButton = enhance(PureResetFormButton);
