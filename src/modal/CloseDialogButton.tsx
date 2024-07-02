import { Button } from 'react-bootstrap';
import { ButtonVariant } from 'react-bootstrap/esm/types';
import { connect } from 'react-redux';

import { translate } from '@waldur/i18n';
import { closeModalDialog } from '@waldur/modal/actions';

interface OwnProps {
  label?: string;
  variant?: ButtonVariant;
  className?: string;
}

interface DispatchProps {
  dismiss(): void;
}

type Props = OwnProps & DispatchProps;

const PureCloseDialogButton = ({
  dismiss,
  label,
  variant = 'secondary',
  className,
}: Props) => (
  <Button className={className} onClick={dismiss} variant={variant}>
    {label || translate('Cancel')}
  </Button>
);

const mapDispatchToProps = (dispatch) => ({
  dismiss: () => dispatch(closeModalDialog()),
});

const enhance = connect<{}, DispatchProps, OwnProps>(
  undefined,
  mapDispatchToProps,
);

export const CloseDialogButton = enhance(PureCloseDialogButton);
