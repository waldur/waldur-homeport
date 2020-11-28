import classNames from 'classnames';
import React from 'react';
import Label from 'react-bootstrap/lib/Label';
import ListGroup from 'react-bootstrap/lib/ListGroup';
import ListGroupItem from 'react-bootstrap/lib/ListGroupItem';

import { Action } from './types';

export interface ActionListProps {
  actions: Action[];
}

export const ActionList = (props: ActionListProps) => (
  <ListGroup className="clear-list">
    {props.actions.map((action, index) => (
      <ListGroupItem
        key={index}
        onClick={action.onClick}
        className={classNames({ 'fist-item': index === 0 })}
      >
        <Label bsStyle="success" className="m-r-sm m-l-sm">
          <i className="fa fa-plus" />
        </Label>
        {action.title}
      </ListGroupItem>
    ))}
  </ListGroup>
);
