import * as classNames from 'classnames';
import * as React from 'react';

import { TranslateProps } from '@waldur/i18n';

import { OfferingAction, OfferingStateTransition } from './types';

interface ActionsDropdownProps extends TranslateProps {
  actions?: Array<OfferingAction<OfferingStateTransition>>;
}

interface ActionsDropdownState {
  open: boolean;
}

export class ActionsDropdown extends React.Component<ActionsDropdownProps & TranslateProps, ActionsDropdownState> {
  constructor(props) {
    super(props);
    this.state = {
      open: false,
    };
  }
  onClick = () => {
    this.setState({open: !this.state.open});
  }
  render() {
    const { actions, translate } = this.props;
    return (
      <div className={classNames('btn-group dropdown', {open: this.state.open})} onClick={this.onClick}>
        <a className="btn btn-default btn-sm">
          <span>{translate('Actions')}</span>
          {' '}
          <span className="caret"/>
        </a>
        <ul className="dropdown-menu dropdown-menu-right">
          {actions.length === 0 &&
            <li role="menuitem">
              <a>{translate('There are no actions.')}</a>
            </li>
          }
          {actions.map((action, index) => (
            <li key={index} className="cursor-pointer">
              <a id={action.value} onClick={action.handler}>
                {action.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    );
  }
}
