import { Button } from 'react-bootstrap';
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

const PureCloseDialogButton = ({
  translate,
  dismiss,
  label,
  className,
}: Props) => (
  <Button className={className} onClick={dismiss}>
    {label || translate('Cancel')}
  </Button>
);

const mapDispatchToProps = (dispatch) => ({
  dismiss: () => dispatch(closeModalDialog()),
});

const enhance = compose(
  connect<{}, DispatchProps, OwnProps>(undefined, mapDispatchToProps),
  withTranslation,
);

export const CloseDialogButton = enhance(PureCloseDialogButton);
