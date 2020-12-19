import { FunctionComponent } from 'react';
import { ListGroup, ListGroupItem } from 'react-bootstrap';

import { Tooltip } from '@waldur/core/Tooltip';

export const MultiSelectField: FunctionComponent<{ input; options }> = ({
  input,
  options,
}) => (
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
