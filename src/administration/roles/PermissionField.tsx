import { Accordion, Card } from 'react-bootstrap';

import { AwesomeCheckbox } from '@waldur/core/AwesomeCheckbox';

import { PermissionOptions } from './PermissionOptions';

export const PermissionField = (props) => (
  <>
    {PermissionOptions.map((entity, entityIndex) => (
      <Accordion key={entityIndex} className="my-2">
        <Card>
          <Accordion.Header>{entity.label}</Accordion.Header>
          <Accordion.Body>
            {entity.options.map((option, optionIndex) => (
              <div key={optionIndex} className="my-2">
                <AwesomeCheckbox
                  label={option.label}
                  value={props.input.value.includes(option.value)}
                  onChange={(event: boolean) => {
                    if (event) {
                      props.input.onChange([
                        ...props.input.value,
                        option.value,
                      ]);
                    } else {
                      props.input.onChange(
                        props.input.value.filter(
                          (item) => item !== option.value,
                        ),
                      );
                    }
                  }}
                />
              </div>
            ))}
          </Accordion.Body>
        </Card>
      </Accordion>
    ))}
  </>
);
