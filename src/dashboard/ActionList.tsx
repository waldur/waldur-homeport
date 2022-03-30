import classNames from 'classnames';
import { FunctionComponent } from 'react';
import { Badge, ListGroup, ListGroupItem } from 'react-bootstrap';

import { Action } from './types';

export interface ActionListProps {
  actions: Action[];
}

export const ActionList: FunctionComponent<ActionListProps> = (props) => (
  <ListGroup className="clear-list">
    {props.actions.map((action, index) => (
      <ListGroupItem
        key={index}
        onClick={action.onClick}
        className={classNames({ 'fist-item': index === 0 })}
      >
        <Badge bg="success" className="m-r-sm m-l-sm">
          <i className="fa fa-plus" />
        </Badge>
        {action.title}
      </ListGroupItem>
    ))}
  </ListGroup>
);
