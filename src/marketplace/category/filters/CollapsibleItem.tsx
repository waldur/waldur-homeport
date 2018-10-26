import * as classNames from 'classnames';
import * as React from 'react';
import { ReactNode } from 'react';

import './CollapsibleItem.scss';

interface CollapsibleItemProps {
  title: ReactNode;
  content: ReactNode;
  selected?: boolean;
  counter?: number;
}

interface CollapsibleItemState {
  collapsed: boolean;
}

export class CollapsibleItem extends React.Component<CollapsibleItemProps, CollapsibleItemState> {
  state = {
    collapsed: false,
  };

  onClick = () => {
    this.setState({collapsed: !this.state.collapsed});
  }

  render() {
    const props = this.props;
    return (
      <div className="collapsible-item">
        <div className={classNames('collapsible-item__title', {selected: props.selected})} onClick={this.onClick}>
          {props.title}
          {' '}
          {this.state.collapsed ? <i className="fa fa-chevron-up" /> : <i className="fa fa-chevron-down" />}
          {' '}
          {props.counter !== 0 && `(${props.counter})`}
        </div>
        <div className={classNames('collapsible-item__content', {collapsed: this.state.collapsed})}>
          {props.content}
        </div>
      </div>
    );
  }
}
