import { PlusIcon, TrashIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import { Table } from 'react-bootstrap';
import { Field } from 'redux-form';

import { InputField } from '@/form/InputField';
import { translate } from '@/i18n';
import { CompactActionButton } from '@/table/CompactActionButton';

const SubNetRow = ({ SubNet: subnet, onRemove }) => (
  <tr>
    <td>
      <Field name={`${subnet}.source`} component={InputField} />
    </td>
    <td>
      <Field name={`${subnet}.destination`} component={InputField} />
    </td>
    <td>
      <CompactActionButton
        title={translate('Remove')}
        action={onRemove}
        iconNode={<TrashIcon weight="bold" />}
        variant="text-secondary"
      />
    </td>
  </tr>
);

const SubNetAddButton = ({ onClick }) => (
  <CompactActionButton
    title={translate('Add')}
    action={onClick}
    iconNode={<PlusIcon weight="bold" />}
    variant="text-secondary"
  />
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
