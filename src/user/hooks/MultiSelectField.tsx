import * as React from 'react';
import * as ListGroup from 'react-bootstrap/lib/ListGroup';
import * as ListGroupItem from 'react-bootstrap/lib/ListGroupItem';

import { Tooltip } from '@waldur/core/Tooltip';

export const MultiSelectField = ({ input, options }) => (
  <ListGroup>
    {options.map((option, index) => (
      <ListGroupItem
        key={index}
        className="checkbox awesome-checkbox checkbox-success"
        disabled={option.disabled}
      >
        <input
          id={`checkbox-${index}`}
          type="checkbox"
          checked={input.value[option.key] || false}
          onChange={(e: React.ChangeEvent<any>) =>
            input.onChange({ ...input.value, [option.key]: e.target.checked })
          }
        />
        <label htmlFor={`checkbox-${index}`}>
          {option.title}
          {option.help_text && (
            <div className="pull-right">
              <Tooltip id={`checkbox-${index}`} label={option.help_text}>
                <i className="fa fa-question-circle" aria-hidden="true" />
              </Tooltip>
            </div>
          )}
        </label>
        {option.subtitle && <small>{option.subtitle}</small>}
      </ListGroupItem>
    ))}
  </ListGroup>
);
