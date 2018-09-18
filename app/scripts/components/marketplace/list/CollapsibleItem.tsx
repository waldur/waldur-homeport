import * as classNames from 'classnames';
import * as React from 'react';
import { ReactNode } from 'react';

import './CollapsibleItem.scss';

interface CollapsibleItemProps {
  title: ReactNode;
  content: ReactNode;
}

interface CollapsibleItemState {
  collapsed: boolean;
}

export class CollapsibleItem extends React.Component<CollapsibleItemProps, CollapsibleItemState> {
  constructor(props) {
    super(props);
    this.state = {
      collapsed: false,
    };
  }

  onClick = () => {
    this.setState({collapsed: !this.state.collapsed});
  }

  render() {
    const props = this.props;
    return (
      <div className="collapsible-item">
        <div className="collapsible-item__title" onClick={this.onClick}>
          {props.title}
          {' '}
          {this.state.collapsed ? <i className="fa fa-chevron-up" /> : <i className="fa fa-chevron-down" />}
        </div>
        <div className={classNames('collapsible-item__content', {collapsed: this.state.collapsed})}>
          {props.content}
        </div>
      </div>
    );
  }
}
