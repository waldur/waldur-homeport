import * as React from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';

import { Tooltip } from '@waldur/core/Tooltip';
import { TranslateProps, withTranslation } from '@waldur/i18n';
import { connectAngularComponent } from '@waldur/store/connect';

type AccountingMode = 'billing' | 'accounting';

interface Props extends TranslateProps {
  estimated?: boolean;
  accountingMode: AccountingMode;
}

class PurePriceTooltip extends React.PureComponent<Props> {
  getTooltipMessage() {
    const { translate, accountingMode, estimated } = this.props;

    // VAT is not included only when accounting mode is activated
    const vatNotIncluded = accountingMode === 'accounting';
    const vatMessage = translate('VAT is not included.');
    const estimatedMessage = translate('Price is estimated.');

    let message = '';
    if (vatNotIncluded) {
      message += vatMessage;
    }

    if (estimated) {
      message += message ? ' ' + estimatedMessage : estimatedMessage;
    }

    return message;
  }

  render() {
    const message = this.getTooltipMessage();
    if (!message) {
      return null;
    }

    return (
      <Tooltip label={message} id="price-tooltip">
        <i className="fa fa-exclamation-circle m-l-xs hidden-print" />
      </Tooltip>
    );
  }
}

const mapStateToProps = state => ({
  accountingMode: state.config.accountingMode,
});

const enhance = compose(connect(mapStateToProps), withTranslation);

export const PriceTooltip = enhance(PurePriceTooltip);

export default connectAngularComponent(PriceTooltip, ['estimated']);
