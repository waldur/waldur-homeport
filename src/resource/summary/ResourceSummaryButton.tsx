import * as classNames from 'classnames';
import * as React from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';

import { TranslateProps, withTranslation } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { connectAngularComponent } from '@waldur/store/connect';

interface PureResourceSummaryButtonProps extends TranslateProps {
  url: string;
  showDetailsModal(): void;
  disabled?: boolean;
}

export const PureResourceSummaryButton = (props: PureResourceSummaryButtonProps) => {
  const { showDetailsModal, translate, disabled } = props;
  return (
    <div
      className={classNames({disabled}, 'btn btn-default btn-sm')}
      onClick={showDetailsModal}>
      {translate('Details')}
    </div>
  );
};

const mapDispatchToProps = (dispatch, ownProps) => ({
  showDetailsModal: (): void => dispatch(openModalDialog(
    'resource-summary-modal', { resolve: { url: ownProps.url } })),
});

const enhance = compose(
  connect(null, mapDispatchToProps),
  withTranslation,
);

export const ResourceSummaryButton = enhance(PureResourceSummaryButton);

export default connectAngularComponent(ResourceSummaryButton, ['url']);
