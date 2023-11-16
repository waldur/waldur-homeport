import { Modal, Tab, Tabs } from 'react-bootstrap';
import { Field, FieldArray } from 'redux-form';

import { SubmitButton } from '@waldur/auth/SubmitButton';
import { required } from '@waldur/core/validators';
import { TextField } from '@waldur/form';
import { translate } from '@waldur/i18n';

const renderFields = ({ fields, submitting, meta: { pristine } }: any) => {
  const allFields = fields.getAll();
  return (
    <>
      <Tabs defaultActiveKey="tab-0" id="notification-templates-tabs">
        {fields.map((template, index) => {
          return (
            <Tab
              title={<>{allFields[index].path}</>}
              eventKey={`tab-${index}`}
              key={`tab-${index}`}
              className="mb-5"
            >
              <Field
                name={`${template}.content`}
                component={TextField}
                type="text"
                label={translate('Content')}
                validate={required}
                required={true}
              />
            </Tab>
          );
        })}
      </Tabs>
      <div className="mb-5 text-end">
        <SubmitButton
          block={false}
          submitting={submitting}
          invalid={pristine}
          label={translate('Save')}
        />
      </div>
    </>
  );
};

export const NotificationForm = ({ submitting }: { submitting: boolean }) => {
  return (
    <Modal.Body className="scroll-y mx-5 mx-xl-15 my-7 size-lg">
      <FieldArray
        name="templates"
        component={renderFields}
        submitting={submitting}
      />
    </Modal.Body>
  );
};
