import { ArrowCounterClockwiseIcon } from '@phosphor-icons/react';
import { Accordion, Button } from 'react-bootstrap';
import { Field } from 'react-final-form';
import { FieldArray } from 'react-final-form-arrays';

import { required } from '@waldur/core/validators';
import { TextField } from '@waldur/form';
import { MonacoField } from '@waldur/form/MonacoField';
import { translate } from '@waldur/i18n';

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

const renderFields = ({ fields }) => {
  return (
    <>
      {fields.map((name, index) => {
        const template = fields.value[index];
        return (
          <Accordion.Item eventKey={index.toString()} key={index}>
            <Accordion.Header>{formatHeader(template.path)}</Accordion.Header>
            <Accordion.Body>
              {template.path.endsWith('message.html') ||
              template.path.endsWith('message.txt') ? (
                <Field
                  name={`${name}.content`}
                  component={MonacoField as any}
                  validate={required}
                  language="django-html"
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

              <div className="mt-1 text-end">
                <Button
                  onClick={() =>
                    fields.update(index, {
                      ...fields.value[index],
                      content: template.original_content,
                    })
                  }
                  variant="warning"
                  size="sm"
                >
                  <span className="svg-icon svg-icon-2">
                    <ArrowCounterClockwiseIcon />
                  </span>{' '}
                  {translate('Reset')}
                </Button>
              </div>
            </Accordion.Body>
          </Accordion.Item>
        );
      })}
    </>
  );
};

export const NotificationForm = ({ submitting }) => (
  <FieldArray
    name="templates"
    component={renderFields}
    props={{ submitting }}
  />
);
