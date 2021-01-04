import { FC } from 'react';
import { connect } from 'react-redux';
import { formValueSelector } from 'redux-form';

import { Tooltip } from '@waldur/core/Tooltip';
import { translate } from '@waldur/i18n';
import { RootState } from '@waldur/store/reducers';

export const tokenOptions = [
  { name: '10 min', value: 600 },
  { name: '30 min', value: 1800 },
  { name: '1 h', value: 3600 },
  { name: '2 h', value: 7200 },
  { name: '12 h', value: 43200 },
  { name: 'token will not timeout', value: null },
];

export const tokenLifetimeTooltip = (
  <Tooltip
    id="token"
    label={translate(
      'Lifetime will be updated and reset upon saving the form.',
    )}
  >
    {translate('API token lifetime')} <i className="fa fa-question-circle" />
  </Tooltip>
);

type StateProps = ReturnType<typeof mapStateToProps>;

const PureTokenLifetimeWarning: FC<StateProps> = (props) =>
  props.token_lifetime === null ? (
    <div className="form-group">
      <p className="help-block text-danger col-sm-offset-3 col-sm-7">
        {translate(
          'By setting token lifetime to indefinite you are allowing anyone who has the token to impersonate your actions till the token has been changed.',
        )}
        {translate(
          'Please make sure you know what you are doing and set to 10 minutes if unsure.',
        )}
      </p>
    </div>
  ) : null;

const mapStateToProps = (state: RootState) => {
  const option = formValueSelector('userEdit')(state, 'token_lifetime');
  return { token_lifetime: option ? option.value : undefined };
};

export const TokenLifetimeWarning = connect(mapStateToProps)(
  PureTokenLifetimeWarning,
);
