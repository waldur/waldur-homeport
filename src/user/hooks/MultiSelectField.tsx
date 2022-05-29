import { FunctionComponent } from 'react';
import { FormCheck, ListGroup, ListGroupItem } from 'react-bootstrap';

import { Tip } from '@waldur/core/Tooltip';

export const MultiSelectField: FunctionComponent<{ input; options }> = ({
  input,
  options,
}) => (
  <ListGroup>
    {options.map((option, index) => (
      <ListGroupItem key={index} className="py-3" disabled={option.disabled}>
        <FormCheck id={`checkbox-${index}`}>
          <FormCheck.Input
            type="checkbox"
            checked={input.value[option.key] || false}
            onChange={(e: React.ChangeEvent<any>) =>
              input.onChange({ ...input.value, [option.key]: e.target.checked })
            }
          />
          <FormCheck.Label className="d-flex justify-content-between">
            {option.title}
            {option.help_text && (
              <div>
                <Tip
                  id={`checkbox-${index}`}
                  label={option.help_text}
                  autoWidth={true}
                >
                  <i className="fa fa-question-circle" aria-hidden="true" />
                </Tip>
              </div>
            )}
          </FormCheck.Label>
        </FormCheck>
        {option.subtitle && <small>{option.subtitle}</small>}
      </ListGroupItem>
    ))}
  </ListGroup>
);
