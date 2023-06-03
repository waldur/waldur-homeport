import { FunctionComponent, useContext, useState } from 'react';
import { Button, Col, Row, Tab, Tabs } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { Field, FieldArray, FormSection } from 'redux-form';

import { SelectField } from '@waldur/form';
import { FormFieldsContext } from '@waldur/form/context';
import { MonacoField } from '@waldur/form/MonacoField';
import { translate } from '@waldur/i18n';
import { OfferingOptionsScriptEditor } from '@waldur/marketplace/offerings/option/OfferingOptionsScriptEditor';
import { getForm } from '@waldur/marketplace/offerings/store/selectors';
import { RootState } from '@waldur/store/reducers';

import { EnvironmentVariablesList } from './EnvironmentVariablesList';
import { TestScriptButton } from './TestScriptButton';

import './ScriptsForm.scss';

const PROGRAMMING_LANGUAGE_CHOICES = [
  {
    label: 'Python',
    value: 'python',
  },
  {
    label: 'Bash',
    value: 'shell',
  },
];

const getLanguage = (state: RootState) =>
  (getForm(state, 'secret_options') || {}).language;

const getScripts = (state: RootState) => {
  const {
    create,
    update,
    pull,
    delete: deleteScript,
  } = getForm(state, 'secret_options') || {};
  return { create, update, pull, delete: deleteScript };
};

const VariablesBlocks = ({ readOnlyFields }) => (
  <>
    <FieldArray
      name="options"
      component={OfferingOptionsScriptEditor}
      readOnly={readOnlyFields.includes('options')}
    />
    <FormSection name="secret_options">
      <FieldArray name="environ" component={EnvironmentVariablesList} />
    </FormSection>
  </>
);

export const ScriptsForm: FunctionComponent<{
  dryRunOfferingScript: Function;
}> = () => {
  const language = useSelector(getLanguage);
  const scripts = useSelector(getScripts);

  const { readOnlyFields } = useContext(FormFieldsContext);
  const [activeScriptTab, setActiveScriptTab] = useState('Create');

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  return (
    <div className="marketplace-script-form bg-body">
      <Row>
        <Col md={12} lg={8} className="pe-10">
          <div className="d-flex justify-content-between py-5">
            <FormSection name="secret_options">
              <Field
                name="language"
                label={translate('Script language')}
                options={PROGRAMMING_LANGUAGE_CHOICES}
                simpleValue={true}
                required={true}
                isClearable={false}
                component={SelectField}
                className="flex-grow-1"
              />
            </FormSection>
            <div className="flex-grow-1 text-end">
              <TestScriptButton
                type={activeScriptTab}
                disabled={!scripts[activeScriptTab.toLowerCase()]}
              />
              <Button
                variant="light"
                className="btn-icon btn-color-dark btn-active-color-dark d-inline d-sm-none"
                onClick={() => setIsDrawerOpen((val) => !val)}
              >
                {isDrawerOpen ? (
                  <i className="fa fa-times" />
                ) : (
                  <i className="fa fa-bars" />
                )}
              </Button>
            </div>
          </div>
        </Col>
      </Row>
      <div className="border-bottom"></div>
      <Row className="position-relative overflow-hidden">
        <Col sm={8} className="script-editor-wrapper pe-10">
          <FormSection name="secret_options">
            <Tabs
              id="script-editor-tabs"
              activeKey={activeScriptTab}
              onSelect={(k) => setActiveScriptTab(k)}
              className=""
            >
              <Tab
                eventKey="Create"
                title={translate('Create')}
                tabClassName="btn btn-light btn-color-dark btn-active-dark rounded-0 w-150px me-1"
              >
                <Field
                  name="create"
                  label={translate('Script for creation of a resource')}
                  required={true}
                  mode={language}
                  component={MonacoField}
                />
              </Tab>
              <Tab
                eventKey="Delete"
                title={translate('Delete')}
                tabClassName="btn btn-light btn-color-dark btn-active-dark rounded-0 w-150px me-1"
              >
                <Field
                  name="delete"
                  label={translate('Script for termination of a resource')}
                  required={true}
                  mode={language}
                  component={MonacoField}
                />
              </Tab>
              <Tab
                eventKey="Update"
                title={translate('Update')}
                tabClassName="btn btn-light btn-color-dark btn-active-dark rounded-0 w-150px me-1"
              >
                <Field
                  name="update"
                  label={translate(
                    'Script for updating a resource on plan change',
                  )}
                  required={true}
                  mode={language}
                  component={MonacoField}
                />
              </Tab>
              <Tab
                eventKey="Pull"
                title={translate('Pull')}
                tabClassName="btn btn-light btn-color-dark btn-active-dark rounded-0 w-150px me-1"
              >
                <Field
                  name="pull"
                  label={translate(
                    'Script for regular update of resource and its accounting',
                  )}
                  required={true}
                  mode={language}
                  component={MonacoField}
                />
              </Tab>
            </Tabs>
          </FormSection>
        </Col>
        {/* Show variables editor as a mobile drawer on smaller than sm screens */}
        <Col className="d-none d-sm-block border-start scroll-y h-650px">
          <VariablesBlocks readOnlyFields={readOnlyFields} />
        </Col>
        <div className="d-block d-sm-none">
          <div
            className={
              'script-editor-drawer drawer drawer-end position-absolute w-400px' +
              (isDrawerOpen ? ' drawer-on' : '')
            }
          >
            <div className="scroll-y mh-650px w-100">
              <VariablesBlocks readOnlyFields={readOnlyFields} />
            </div>
          </div>
          {isDrawerOpen && <div className="drawer-overlay"></div>}
        </div>
      </Row>
    </div>
  );
};
