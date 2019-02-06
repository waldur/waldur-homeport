import * as classNames from 'classnames';
import * as React from 'react';

import { translate } from '@waldur/i18n';

interface UserPasswordProps {
  password: string;
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
          title={translate('Show password')}
          onClick={this.toggle}
        />
        {' '}
        {
          this.state.showPassword ?
          this.props.password :
          '***************'
        }
      </span>
    );
  }
}
