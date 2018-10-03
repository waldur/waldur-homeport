import * as classNames from 'classnames';
import * as React from 'react';

import { FormField } from './types';

interface SecretFieldProps extends FormField {
  placeholder?: string;
}

export class SecretField extends React.Component<SecretFieldProps> {
  state = {
    showSecret: false,
  };

  onToggle = () => {
    this.setState({showSecret: !this.state.showSecret});
  }

  render() {
    const { input, label, validate, ...rest } = this.props;
    const { showSecret } = this.state;
    const iconClass = classNames('fa password-icon', {
      'fa-eye-slash': showSecret,
      'fa-eye': !showSecret,
    });
    return (
      <div className="has-password">
        <input
          {...this.props.input}
          type={showSecret ? 'text' : 'password'}
          autoComplete="new-password"
          className="form-control"
          placeholder={this.props.placeholder}
          {...rest}/>
        <a className={iconClass}
          title={showSecret ? 'Hide' : 'Show'}
          onClick={this.onToggle}/>
      </div>
    );
  }
}
