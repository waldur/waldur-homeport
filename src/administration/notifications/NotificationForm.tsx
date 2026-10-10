import { useState } from 'react';
import { FieldArray, FieldArrayRenderProps } from 'react-final-form-arrays';

import { Tabs, TabsList, TabsTrigger, TabsContent } from 'waldur-ui';

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
    <Tabs
      mount="all"
      value={activeKey}
      onValueChange={(key) => key && setActiveKey(key)}
    >
      <TabsList className="mb-3">
        {fields.value.map((template) => (
          <TabsTrigger key={template.path} value={template.path}>
            {formatHeader(template.path)}
          </TabsTrigger>
        ))}
        <TabsTrigger value="variables">
          {translate('Available variables')}
        </TabsTrigger>
      </TabsList>
      <>
        {fields.map((name, index) => {
          const template = fields.value[index];
          const isRich =
            template.path.endsWith('message.html') ||
            template.path.endsWith('message.txt');
          const isSubject = template.path.endsWith('subject.txt');
          return (
            <TabsContent key={template.path} value={template.path}>
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
            </TabsContent>
          );
        })}
        <TabsContent value="variables">
          <VariablesPane schema={schema} />
        </TabsContent>
      </>
    </Tabs>
  );
};

export const NotificationForm = ({ schema }) => (
  <FieldArray name="templates" component={NotificationTabs} schema={schema} />
);
