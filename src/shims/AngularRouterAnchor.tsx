/*
 * SafeAnchor component from react-bootstrap library conflicts with Angular UI Router.
 * As a result, when user clicks on SafeAnchor he is redirected to initial state.
 * This is temporary workaround which strips '#' href from vanilla component.
 * See also:
 * https://github.com/react-bootstrap/react-bootstrap/issues/1979
 * https://github.com/react-bootstrap/react-bootstrap/issues/2205
 */

import * as React from 'react';

/**
 * There are situations due to browser quirks or Bootstrap CSS where
 * an anchor tag is needed, when semantically a button tag is the
 * better choice. SafeAnchor ensures that when an anchor is used like a
 * button its accessible. It also emulates input `disabled` behavior for
 * links, which is usually desirable for Buttons, NavItems, MenuItems, etc.
 */
class SafeAnchor extends React.Component<any> {
  static defaultProps = {
    componentClass: 'a',
  };

  handleClick = event => {
    const { disabled, onClick } = this.props;

    if (disabled) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }

    if (onClick) {
      onClick(event);
    }
  };

  handleKeyDown = event => {
    if (event.key === ' ') {
      event.preventDefault();
      this.handleClick(event);
    }
  };

  render() {
    const {
      componentClass: Component,
      disabled,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      eventKey,
      ...props
    } = this.props;
    let newProps = props;

    if (disabled) {
      newProps = {
        ...props,
        tabIndex: -1,
        style: { pointerEvents: 'none', ...props.style },
      };
    }

    return (
      <Component
        {...newProps}
        onClick={this.handleClick}
        onKeyDown={this.handleKeyDown}
      />
    );
  }
}

export default SafeAnchor;
