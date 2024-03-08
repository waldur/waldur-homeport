import classNames from 'classnames';
import { Component } from 'react';

export class SecretField extends Component<
  { value: string },
  { showSecret: boolean }
> {
  state = {
    showSecret: false,
  };

  render() {
    return (
      <>
        <button
          className={this.getClassName()}
          type="button"
          onClick={this.toggle}
        >
          &nbsp;
        </button>{' '}
        {this.getValue()}
      </>
    );
  }

  toggle = () => {
    this.setState((state) => ({
      showSecret: !state.showSecret,
    }));
  };

  getClassName = () =>
    classNames('text-btn fa', {
      'fa-eye-slash': this.state.showSecret,
      'fa-eye': !this.state.showSecret,
    });

  getValue = () =>
    this.state.showSecret
      ? this.props.value
      : this.props.value
          .split('')
          .map(() => '*')
          .join('');
}
