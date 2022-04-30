import { FC } from 'react';
import { Form } from 'react-bootstrap';
import { connect } from 'react-redux';
import { formValueSelector } from 'redux-form';

import { Tip } from '@waldur/core/Tooltip';
import { translate } from '@waldur/i18n';
import { RootState } from '@waldur/store/reducers';

export const getTokenOptions = () => [
  { name: translate('10 minutes'), value: 600 },
  { name: translate('30 minutes'), value: 1800 },
  { name: translate('1 hour'), value: 3600 },
  { name: translate('2 hours'), value: 7200 },
  { name: translate('12 hours'), value: 43200 },
  { name: translate('token will not timeout'), value: null },
];

export const TokenLifetimeTooltip = (
  <Tip
    id="token"
    label={translate(
      'Lifetime will be updated and reset upon saving the form.',
    )}
  >
    {translate('Token lifetime')} <i className="fa fa-question-circle" />
  </Tip>
);

type StateProps = ReturnType<typeof mapStateToProps>;

const PureTokenLifetimeWarning: FC<StateProps> = (props) =>
  props.token_lifetime === null ? (
    <Form.Group>
      <Form.Text className="text-danger col-sm-offset-3 col-sm-7">
        {translate(
          'By setting token lifetime to indefinite you are allowing anyone who has the token to impersonate your actions till the token has been changed.',
        )}
        {translate(
          'Please make sure you know what you are doing and set to 10 minutes if unsure.',
        )}
      </Form.Text>
    </Form.Group>
  ) : null;

const mapStateToProps = (state: RootState) => {
  const option = formValueSelector('userEdit')(state, 'token_lifetime');
  return { token_lifetime: option ? option.value : undefined };
};

export const TokenLifetimeWarning = connect(mapStateToProps)(
  PureTokenLifetimeWarning,
);
