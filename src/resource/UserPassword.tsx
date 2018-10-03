import * as classNames from 'classnames';
import * as React from 'react';

import { TranslateProps } from '@waldur/i18n';

interface UserPasswordProps extends TranslateProps {
  resource: {
    user_password: string;
  };
}

export class UserPassword extends React.Component<UserPasswordProps> {
  state = {
    showPassword: false,
  };

  toggle = () => this.setState({
    showPassword: !this.state.showPassword,
  })

  render() {
    const iconClass = classNames('fa', {
      'fa-eye': !this.state.showPassword,
      'fa-eye-slash': this.state.showPassword,
    });
    return (
      <span>
        <a
          className={iconClass}
          title={this.props.translate('Show password')}
          onClick={this.toggle}
        />
        {' '}
        {
          this.state.showPassword ?
          this.props.resource.user_password :
          '***************'
        }
      </span>
    );
  }
}
