import { Eye, EyeSlash } from '@phosphor-icons/react';
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
        <button className="text-btn" type="button" onClick={this.toggle}>
          {this.state.showSecret ? <EyeSlash size={20} /> : <Eye size={20} />}
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

  getValue = () =>
    this.state.showSecret
      ? this.props.value
      : this.props.value
          .split('')
          .map(() => '*')
          .join('');
}
