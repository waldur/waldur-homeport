import { useMemo } from 'react';
import { Accordion, Card } from 'react-bootstrap';

import { AwesomeCheckbox } from '@waldur/core/AwesomeCheckbox';
import { Badge } from '@waldur/core/Badge';
import { translate } from '@waldur/i18n';

import { PermissionOptions } from './PermissionOptions';

const PermissionEntity = (props) => {
  const accessType = useMemo(
    () =>
      props.entity.options.every((option) =>
        props.input.value.includes(option.value),
      )
        ? 'FULL_ACCESS'
        : props.entity.options.find((option) =>
              props.input.value.includes(option.value),
            )
          ? 'PARTIAL_ACCESS'
          : 'NO_ACCESS',
    [props.entity, props.input.value],
  );
  return (
    <Accordion className="my-2">
      <Card>
        <Accordion.Header>
          <div className="flex-grow-1">{props.entity.label}</div>{' '}
          <Badge
            variant={
              accessType === 'FULL_ACCESS'
                ? 'success'
                : accessType === 'PARTIAL_ACCESS'
                  ? 'primary'
                  : 'danger'
            }
            outline
            pill
            className="mx-2"
          >
            {accessType === 'FULL_ACCESS'
              ? translate('Full access')
              : accessType === 'PARTIAL_ACCESS'
                ? translate('Partial access')
                : translate('No access')}
          </Badge>
        </Accordion.Header>
        <Accordion.Body>
          {props.entity.options.map((option, optionIndex) => (
            <div key={optionIndex} className="my-2">
              <AwesomeCheckbox
                label={option.label}
                value={props.input.value.includes(option.value)}
                onChange={(event: boolean) => {
                  if (event) {
                    props.input.onChange([...props.input.value, option.value]);
                  } else {
                    props.input.onChange(
                      props.input.value.filter((item) => item !== option.value),
                    );
                  }
                }}
              />
            </div>
          ))}
        </Accordion.Body>
      </Card>
    </Accordion>
  );
};

export const PermissionField = (props) => (
  <>
    {PermissionOptions.map((entity, entityIndex) => (
      <PermissionEntity entity={entity} key={entityIndex} input={props.input} />
    ))}
  </>
);
