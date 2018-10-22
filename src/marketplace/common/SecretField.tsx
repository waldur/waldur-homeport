import * as classNames from 'classnames';
import * as React from 'react';

export class SecretField extends React.Component<{value: string}, {showSecret: boolean}> {
  state = {
    showSecret: false,
  };

  render() {
    return (
      <>
        <a className={this.getClassName()} onClick={this.toggle}/>
        {' '}
        {this.getValue()}
      </>
    );
  }

  toggle = () => {
    this.setState(state => ({
      showSecret: !state.showSecret,
    }));
  }

  getClassName = () =>
    classNames('fa', {
      'fa-eye-slash': this.state.showSecret,
      'fa-eye': !this.state.showSecret,
    })

  getValue = () =>
    this.state.showSecret ?
    this.props.value :
    this.props.value.split('').map(() =>  '*').join('')
}
