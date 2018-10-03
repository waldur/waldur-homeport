import * as React from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';

import { TranslateProps, withTranslation } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { connectAngularComponent } from '@waldur/store/connect';

interface OfferingReportButtonProps extends TranslateProps {
  openReport: () => void;
  offering: {
    report?: object;
  };
}

export const PureOfferingReportButton = (props: OfferingReportButtonProps) => (
  props.offering.report ? (
    <button
      className="btn btn-info pull-right btn-sm m-l-sm"
      onClick={props.openReport}>
      <i className="fa fa-book"/>&nbsp;
      {props.translate('Show report')}
    </button>
  ) : null
);

export const openReport = report => openModalDialog('offeringReportDialog', {resolve: {report}, size: 'lg'});

const mapDispatchToProps = (dispatch, ownProps) => ({
  openReport: () => dispatch(openReport(ownProps.offering.report)),
});

const enhance = compose(withTranslation, connect(null, mapDispatchToProps));

const OfferingReportButton = enhance(PureOfferingReportButton);

export default connectAngularComponent(OfferingReportButton, ['offering']);
