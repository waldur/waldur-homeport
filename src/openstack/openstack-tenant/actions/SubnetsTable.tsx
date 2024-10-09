import { Plus, Trash } from '@phosphor-icons/react';
import { FC } from 'react';
import { Button, Table } from 'react-bootstrap';
import { Field } from 'redux-form';

import { InputField } from '@waldur/form/InputField';
import { translate } from '@waldur/i18n';

const SubNetRow = ({ SubNet: subnet, onRemove }) => (
  <tr>
    <td>
      <Field name={`${subnet}.source`} component={InputField} />
    </td>
    <td>
      <Field name={`${subnet}.destination`} component={InputField} />
    </td>
    <td>
      <Button variant="default" onClick={onRemove} size="sm">
        <span className="svg-icon svg-icon-2">
          <Trash />
        </span>{' '}
        {translate('Remove')}
      </Button>
    </td>
  </tr>
);

const SubNetAddButton = ({ onClick }) => (
  <Button variant="default" onClick={onClick} size="sm">
    <span className="svg-icon svg-icon-2">
      <Plus />
    </span>{' '}
    {translate('Add')}
  </Button>
);

export const SubnetsTable: FC<{ fields }> = ({ fields }) => {
  return (
    <>
      {fields.length > 0 ? (
        <>
          <Table
            responsive={true}
            bordered={true}
            striped={true}
            className="mt-3"
          >
            <thead>
              <tr>
                <th>{translate('Source')}</th>
                <th>{translate('Destination')}</th>
                <th>{translate('Actions')}</th>
              </tr>
            </thead>

            <tbody>
              {fields.map((subnet, index) => (
                <SubNetRow
                  key={subnet}
                  SubNet={subnet}
                  onRemove={() => fields.remove(index)}
                />
              ))}
            </tbody>
          </Table>
          <SubNetAddButton onClick={() => fields.push({})} />
        </>
      ) : (
        <SubNetAddButton onClick={() => fields.push({})} />
      )}
    </>
  );
};
