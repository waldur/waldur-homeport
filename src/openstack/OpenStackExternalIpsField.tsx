import { PlusIcon } from '@phosphor-icons/react';
import { Form } from 'react-bootstrap';
import { BaseFieldArrayProps, FieldArray, FormSection } from 'redux-form';

import { translate } from '@/i18n';
import { ActionButton } from '@/table/ActionButton';
import { RemovalActionButton } from '@/table/RemovalActionButton';

import { StringField } from './StringField';

const FieldsListGroup = ({ fields }: BaseFieldArrayProps<any>) => {
  const addRow = () => {
    fields.push({});
  };

  const removeRow = (index) => fields._isFieldArray && fields.remove(index);

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
                {fields.map((component, i) => (
                  <FormSection name={component} key={i}>
                    <tr>
                      <td>
                        <StringField name="floating_ip" />
                      </td>
                      <td>
                        <StringField name="external_ip" />
                      </td>
                      <td>
                        <RemovalActionButton action={() => removeRow(i)} />
                      </td>
                    </tr>
                  </FormSection>
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
  <FieldArray name="value" component={FieldsListGroup} rerenderOnEveryChange />
);
