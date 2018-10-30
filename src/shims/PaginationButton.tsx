import * as classNames from 'classnames';
import * as React from 'react';

import SafeAnchor from './AngularRouterAnchor';
import createChainedFunction from './createChainedFunction';

interface PaginationButtonProps {
  componentClass?: React.ComponentType<{disabled?: boolean, onClick: any}>;
  className?: string;
  eventKey?: any;
  onSelect?(eventKey: any, e: React.SyntheticEvent<{}>): void;
  disabled?: boolean;
  active?: boolean;
  onClick?(event: React.MouseEvent<{}>): void;
  style?: React.CSSProperties;
}

class PaginationButton extends React.Component<PaginationButtonProps> {
  static defaultProps = {
    componentClass: SafeAnchor,
    active: false,
    disabled: false,
  };

  handleClick = event => {
    const { disabled, onSelect, eventKey } = this.props;

    if (disabled) {
      return;
    }

    if (onSelect) {
      onSelect(eventKey, event);
    }
  }

  render() {
    const {
      componentClass: Component,
      active,
      disabled,
      onClick,
      className,
      style,
      ...props} = this.props;

    delete props.onSelect;

    return (
      <li
        className={classNames(className, { active, disabled })}
        style={style}
      >
        <SafeAnchor
          {...props}
          disabled={disabled}
          onClick={createChainedFunction(onClick, this.handleClick)}
        />
      </li>
    );
  }
}

export default PaginationButton;
