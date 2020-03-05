import * as React from 'react';
import { connect } from 'react-redux';
import Select from 'react-select';
import { compose } from 'redux';
import { Field } from 'redux-form';

import { translate } from '@waldur/i18n';

interface Option {
  value: string;
  label: string;
}

interface StateProps {
  orderFilterStateOptions: Option[];
}

type Props = StateProps;
class PureOrderStateFilter extends React.Component<Props> {
  render() {
    return (
      <div className="form-group col-sm-3">
        <label className="control-label">{translate('State')}</label>
        <Field
          name="state"
          component={fieldProps => (
            <Select
              placeholder={translate('Select state...')}
              options={this.props.orderFilterStateOptions}
              value={fieldProps.input.value}
              onChange={value => fieldProps.input.onChange(value)}
            />
          )}
        />
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    orderFilterStateOptions: state.marketplace.orders.tableFilter.stateOptions,
  };
};

const enhance = compose(connect(mapStateToProps));

export const OrderStateFilter = enhance(PureOrderStateFilter);
