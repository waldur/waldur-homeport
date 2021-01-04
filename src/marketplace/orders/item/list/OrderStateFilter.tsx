import { FC } from 'react';
import { connect } from 'react-redux';
import Select from 'react-select';
import { compose } from 'redux';
import { Field } from 'redux-form';

import { translate } from '@waldur/i18n';
import { RootState } from '@waldur/store/reducers';

type StateProps = ReturnType<typeof mapStateToProps>;

const PureOrderStateFilter: FC<StateProps> = (props) => (
  <div className="form-group col-sm-3">
    <label className="control-label">{translate('State')}</label>
    <Field
      name="state"
      component={(fieldProps) => (
        <Select
          placeholder={translate('Select state...')}
          options={props.orderFilterStateOptions}
          value={fieldProps.input.value}
          onChange={(value) => fieldProps.input.onChange(value)}
          isClearable={true}
        />
      )}
    />
  </div>
);

const mapStateToProps = (state: RootState) => {
  return {
    orderFilterStateOptions: state.marketplace.orders.tableFilter.stateOptions,
  };
};

const enhance = compose(connect(mapStateToProps));

export const OrderStateFilter = enhance(PureOrderStateFilter);
