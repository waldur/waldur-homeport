import React from 'react';
import { Button, Table } from 'react-bootstrap';
import { Field, WrappedFieldArrayProps } from 'redux-form';

import { required } from '@waldur/core/validators';
import { renderValidationWrapper } from '@waldur/form/FieldValidationWrapper';
import { InputField } from '@waldur/form/InputField';
import { translate } from '@waldur/i18n';

import { validateIPv4 } from '../utils';

export interface StaticRoute {
  destination: string;
  nexthop: string;
}

const validateFixedIPs = (fixedIps) => (value) => {
  if (fixedIps.includes(value)) {
    return translate('IP address is already used by router.');
  }
};

const ValidatedInputField = renderValidationWrapper(InputField);

const StaticRouteRow = ({ route, nexthopValidator, onRemove }) => (
  <tr>
    <td>
      <Field
        name={`${route}.destination`}
        component={ValidatedInputField}
        validate={required}
      />
    </td>
    <td>
      <Field
        name={`${route}.nexthop`}
        component={ValidatedInputField}
        validate={nexthopValidator}
      />
    </td>
    <td>
      <Button bsStyle="default" onClick={onRemove} bsSize="small">
        <i className="fa fa-trash" /> {translate('Remove')}
      </Button>
    </td>
  </tr>
);

const StaticRouteAddButton = ({ onClick }) => (
  <Button bsStyle="default" onClick={onClick} bsSize="small">
    <i className="fa fa-plus" /> {translate('Add route')}
  </Button>
);

export const StaticRoutesTable: React.FC<
  WrappedFieldArrayProps & { fixedIps?: string[] }
> = ({ fields, fixedIps }) => {
  const nexthopValidator = React.useMemo(
    () => [required, validateIPv4, validateFixedIPs(fixedIps)],
    [fixedIps],
  );

  return (
    <>
      {fields.length > 0 ? (
        <>
          <Table
            responsive={true}
            bordered={true}
            striped={true}
            className="m-t-md"
          >
            <thead>
              <tr>
                <th>{translate('Destination (CIDR)')}</th>
                <th>{translate('Next hop (IP)')}</th>
                <th>{translate('Actions')}</th>
              </tr>
            </thead>

            <tbody>
              {fields.map((route, index) => (
                <StaticRouteRow
                  key={route}
                  route={route}
                  nexthopValidator={nexthopValidator}
                  onRemove={() => fields.remove(index)}
                />
              ))}
            </tbody>
          </Table>
          <StaticRouteAddButton onClick={() => fields.push({})} />
        </>
      ) : (
        <StaticRouteAddButton onClick={() => fields.push({})} />
      )}
    </>
  );
};

StaticRoutesTable.defaultProps = {
  fixedIps: [],
};
