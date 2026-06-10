import { useState } from 'react';
import { Nav, Tab } from 'react-bootstrap';
import { FieldArray, FieldArrayRenderProps } from 'react-final-form-arrays';

import { required } from '@/core/validators';
import { MonacoGroup, TextGroup } from '@/form';
import { translate } from '@/i18n';

import { VariablesPane } from './VariablesPane';

interface Template {
  path: string;
  content: string;
  original_content: string;
}

export const formatHeader = (path) => {
  if (path.endsWith('.html')) {
    return translate('HTML message');
  } else if (path.endsWith('.txt') && !path.endsWith('subject.txt')) {
    return translate('Plain text message');
  } else if (path.endsWith('subject.txt')) {
    return translate('Subject');
  } else {
    return path;
  }
};

const NotificationTabs = ({
  fields,
  schema,
}: FieldArrayRenderProps<Template, HTMLElement> & { schema }) => {
  const firstKey = fields.value[0]?.path ?? 'variables';
  const [activeKey, setActiveKey] = useState<string>(firstKey);

  return (
    <Tab.Container
      activeKey={activeKey}
      onSelect={(key) => key && setActiveKey(key)}
    >
      <Nav variant="tabs" className="nav-line-tabs mb-3">
        {fields.value.map((template) => (
          <Nav.Item key={template.path}>
            <Nav.Link eventKey={template.path}>
              {formatHeader(template.path)}
            </Nav.Link>
          </Nav.Item>
        ))}
        <Nav.Item>
          <Nav.Link eventKey="variables">
            {translate('Available variables')}
          </Nav.Link>
        </Nav.Item>
      </Nav>
      <Tab.Content>
        {fields.map((name, index) => {
          const template = fields.value[index];
          const isRich =
            template.path.endsWith('message.html') ||
            template.path.endsWith('message.txt');
          const isSubject = template.path.endsWith('subject.txt');
          return (
            <Tab.Pane key={template.path} eventKey={template.path}>
              {isRich ? (
                <MonacoGroup
                  name={`${name}.content`}
                  validate={required}
                  language="django-html"
                  height={400}
                />
              ) : (
                <TextGroup
                  name={`${name}.content`}
                  rows={isSubject ? 4 : 10}
                  placeholder={template.original_content}
                  validate={required}
                />
              )}
            </Tab.Pane>
          );
        })}
        <Tab.Pane eventKey="variables">
          <VariablesPane schema={schema} />
        </Tab.Pane>
      </Tab.Content>
    </Tab.Container>
  );
};

export const NotificationForm = ({ schema }) => (
  <FieldArray name="templates" component={NotificationTabs} schema={schema} />
);
