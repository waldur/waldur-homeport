import * as classNames from 'classnames';
import * as React from 'react';

interface SecretValueFieldProps {
  value: string;
  className?: string;
}

export class SecretValueField extends React.Component<SecretValueFieldProps> {
  state = {
    showSecret: false,
  };

  onToggle = () => {
    this.setState({showSecret: !this.state.showSecret});
  }

  render() {
    const { showSecret } = this.state;
    const iconClass = classNames('fa password-icon', {
      'fa-eye-slash': showSecret,
      'fa-eye': !showSecret,
    });
    return (
      <div className={classNames('has-password', this.props.className)}>
        <input
          readOnly={true}
          value={this.props.value}
          type={showSecret ? 'text' : 'password'}
          autoComplete="new-password"
          className="form-control"
        />
        <a className={iconClass}
          title={showSecret ? 'Hide' : 'Show'}
          onClick={this.onToggle}/>
      </div>
    );
  }
}
