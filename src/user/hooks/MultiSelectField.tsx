import { QuestionIcon } from '@phosphor-icons/react';
import { FunctionComponent } from 'react';
import { ListGroup, ListGroupItem } from 'react-bootstrap';

import { Checkbox, Tooltip } from 'waldur-ui';

export const MultiSelectField: FunctionComponent<{ input; options }> = ({
  input,
  options,
}) => (
  <ListGroup
    style={{
      height: 300,
      overflow: 'scroll',
    }}
  >
    {options.map((option, index) => (
      <ListGroupItem key={index} className="py-3" disabled={option.disabled}>
        <Checkbox
          id={`checkbox-${index}`}
          checked={input.value[option.key] || false}
          disabled={option.disabled}
          onChange={(e) =>
            input.onChange({
              ...input.value,
              [option.key]: e.target.checked,
            })
          }
          label={
            <span className="d-flex justify-content-between gap-2">
              {option.title}
              {option.help_text && (
                <Tooltip label={option.help_text} autoWidth={true}>
                  <QuestionIcon weight="bold" />
                </Tooltip>
              )}
            </span>
          }
        />
        {option.subtitle && <small>{option.subtitle}</small>}
      </ListGroupItem>
    ))}
  </ListGroup>
);
