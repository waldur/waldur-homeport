import { ArrowCounterClockwiseIcon } from '@phosphor-icons/react';
import { Tab, Tabs } from 'react-bootstrap';
import { Field } from 'react-final-form';
import { FieldArray, FieldArrayRenderProps } from 'react-final-form-arrays';

import { required } from '@/core/validators';
import { TextField } from '@/form';
import { MonacoField } from '@/form/MonacoField';
import { translate } from '@/i18n';
import { CompactActionButton } from '@/table/CompactActionButton';

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
}: FieldArrayRenderProps<Template, HTMLElement> & { schema }) => (
  <Tabs
    defaultActiveKey={0}
    id="notification-templates-tabs"
    className="nav-line-tabs"
  >
    {fields.map((name, index) => {
      const template = fields.value[index];
      return (
        <Tab
          // STEP 2: Use a stable key. The template path is unique and won't change.
          // Using `index` can sometimes cause issues if the array were to be reordered.
          key={template.path}
          eventKey={index}
          title={formatHeader(template.path)}
          className="p-3"
        >
          {template.path.endsWith('message.html') ||
          template.path.endsWith('message.txt') ? (
            <Field
              name={`${name}.content`}
              component={MonacoField as any}
              validate={required}
              language="django-html"
              height={400}
            />
          ) : (
            <Field
              name={`${name}.content`}
              component={TextField as any}
              rows={template.path.endsWith('subject.txt') ? 1 : 10}
              type="text"
              placeholder={template.original_content}
              validate={required}
            />
          )}
          <div className="mt-2 text-end">
            <CompactActionButton
              action={() =>
                fields.update(index, {
                  ...fields.value[index],
                  content: template.original_content,
                })
              }
              variant="warning"
              iconNode={<ArrowCounterClockwiseIcon weight="bold" />}
              title={translate('Reset to default')}
            />
          </div>
        </Tab>
      );
    })}
    <Tab
      title={translate('Available variables')}
      className="p-3"
      eventKey="variables"
    >
      <VariablesPane schema={schema} />
    </Tab>
  </Tabs>
);

export const NotificationForm = ({ schema }) => (
  <FieldArray name="templates" component={NotificationTabs} schema={schema} />
);
