import * as classNames from 'classnames';
import * as React from 'react';
import * as Label from 'react-bootstrap/lib/Label';
import * as ListGroup from 'react-bootstrap/lib/ListGroup';
import * as ListGroupItem from 'react-bootstrap/lib/ListGroupItem';

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
