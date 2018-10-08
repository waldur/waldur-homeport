import * as React from 'react';

export interface ToggleOpenProps {
  isOpen: boolean;
  handleToggleOpen(): void;
}

export const toggleOpen = OriginalComponent => class ToggleOpen extends React.Component<any> {
  state = { isOpen: false };

  handleToggleOpen = () => this.setState({ isOpen: !this.state.isOpen });

  render() {
    return (<OriginalComponent {...this.props} {...this.state} handleToggleOpen={this.handleToggleOpen} />);
  }
};
