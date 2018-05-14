import * as React from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';

import { TranslateProps, withTranslation } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { BaseResource } from '@waldur/resource/types';
import { connectAngularComponent } from '@waldur/store/connect';

interface PureResorceSummaryButtonProps extends TranslateProps {
  resource: BaseResource;
  showDetailsModal(): void;
}

export const PureResorceSummaryButton = (props: PureResorceSummaryButtonProps) => {
  const { showDetailsModal, translate } = props;
  return (
    <div className="btn btn-default btn-sm" onClick={showDetailsModal}>{translate('Details')}</div>
  );
};

const mapDispatchToProps = (dispatch, ownProps) => ({
  showDetailsModal: (): void => dispatch(openModalDialog('resource-summary-modal', { resolve: { url: ownProps.resource.url } })),
});

const enhance = compose(
  withTranslation,
  connect(null, mapDispatchToProps),
);

export const ResorceSummaryButton = enhance(PureResorceSummaryButton);

export default connectAngularComponent(ResorceSummaryButton, ['resource']);
