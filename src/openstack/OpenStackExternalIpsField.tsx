import { PlusIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import { Form } from 'react-bootstrap';
import { FieldArray, FieldArrayRenderProps } from 'react-final-form-arrays';

import { StringGroup } from '@/form';
import { translate } from '@/i18n';
import { ActionButton } from '@/table/ActionButton';
import { RemovalActionButton } from '@/table/RemovalActionButton';

const FieldsListGroup: FC<FieldArrayRenderProps<any, any>> = ({ fields }) => {
  const addRow = () => {
    fields.push({});
  };

  const removeRow = (index) => fields.remove(index);

  return (
    <>
      {fields.length > 0 && (
        <Form.Group id="openstack-external-ip-set">
          <div>
            <table className="table px-0 mb-0">
              <thead>
                <tr>
                  <td className="w-50">{translate('Floating IP')}</td>
                  <td>{translate('External IP')}</td>
                  <td className="w-5px" />
                </tr>
              </thead>
              <tbody>
                {fields.map((member, i) => (
                  <tr key={member}>
                    <td>
                      <StringGroup name={`${member}.floating_ip`} />
                    </td>
                    <td>
                      <StringGroup name={`${member}.external_ip`} />
                    </td>
                    <td>
                      <RemovalActionButton action={() => removeRow(i)} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Form.Group>
      )}
      <div>
        <ActionButton
          title={translate('Add')}
          action={addRow}
          iconNode={<PlusIcon weight="bold" />}
          variant="tertiary"
        />
      </div>
    </>
  );
};

export const OpenStackExternalIpsField = () => (
  <FieldArray name="value" component={FieldsListGroup} />
);
