import { Button } from 'react-bootstrap';
import { connect } from 'react-redux';

import { translate } from '@waldur/i18n';
import { closeModalDialog } from '@waldur/modal/actions';

interface OwnProps {
  label?: string;
  className?: string;
}

interface DispatchProps {
  dismiss(): void;
}

type Props = OwnProps & DispatchProps;

const PureCloseDialogButton = ({ dismiss, label, className }: Props) => (
  <Button className={className} onClick={dismiss} variant="secondary">
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
