import { PureComponent } from 'react';
import { connect } from 'react-redux';

import { Tip } from '@waldur/core/Tooltip';
import { translate } from '@waldur/i18n';
import { RootState } from '@waldur/store/reducers';

type AccountingMode = 'billing' | 'accounting';

interface PriceTooltipProps {
  estimated?: boolean;
  accountingMode: AccountingMode;
}

class PurePriceTooltip extends PureComponent<PriceTooltipProps> {
  getTooltipMessage() {
    const { accountingMode, estimated } = this.props;

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
      <Tip label={message} id="price-tooltip">
        <i className="fa fa-exclamation-circle ms-1 hidden-print" />
      </Tip>
    );
  }
}

const mapStateToProps = (state: RootState) => ({
  accountingMode: state.config.accountingMode,
});

const enhance = connect(mapStateToProps);

export const PriceTooltip = enhance(PurePriceTooltip);
