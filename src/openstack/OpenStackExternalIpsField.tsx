import { PlusIcon, TrashIcon } from '@phosphor-icons/react';
import { Form } from 'react-bootstrap';
import { BaseFieldArrayProps, FieldArray, FormSection } from 'redux-form';

import { translate } from '@waldur/i18n';
import { ActionButton } from '@waldur/table/ActionButton';

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
                        <ActionButton
                          action={() => removeRow(i)}
                          iconNode={<TrashIcon weight="bold" />}
                          variant="danger"
                        />
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
