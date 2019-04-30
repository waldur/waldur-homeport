import * as React from 'react';

import { translate } from '@waldur/i18n';
import { terminateOrderItem } from '@waldur/marketplace/common/api';
import ActionButton from '@waldur/table-react/ActionButton';

export class OrderItemTerminateButton extends React.Component<{uuid: string}> {
  state = {
    loading: false,
  };

  terminateOrderItem = async () => {
    this.setState({ loading: true });
    await terminateOrderItem(this.props.uuid);
    this.setState({ loading: false });
  }

  render() {
    return (
      <ActionButton
        className="btn btn-sm btn-danger m-b-sm"
        title={translate('Cancel')}
        action={this.terminateOrderItem}
        disabled={this.state.loading}
        icon={this.state.loading ? 'fa fa-spinner fa-spin' : 'fa fa-trash'}
      />
    );
  }
}
