import { FC } from 'react';
import { Form } from 'react-bootstrap';
import { Field, useField } from 'react-final-form';

import { NumberField } from '@/form';
import { translate } from '@/i18n';
import { FormGroup } from '@/marketplace/offerings/FormGroup';
import { RichTextToolbarLevel } from '@/marketplace-checklist/types';

const TOOLBAR_OPTIONS: Array<{ value: RichTextToolbarLevel; label: string }> = [
  {
    value: 'minimal',
    label: translate('Minimal — bold/italic/lists only'),
  },
  {
    value: 'standard',
    label: translate('Standard — adds headings, links, quote'),
  },
  {
    value: 'extended',
    label: translate('Extended — adds tables, code blocks'),
  },
];

const ToolbarLevelRadioField: FC = () => {
  const { input } = useField<RichTextToolbarLevel>('rich_text_toolbar_level', {
    subscription: { value: true },
    defaultValue: 'standard',
  });
  return (
    <div className="d-flex flex-column gap-2">
      {TOOLBAR_OPTIONS.map((opt) => (
        <Form.Check
          key={opt.value}
          type="radio"
          id={`rich-text-toolbar-${opt.value}`}
          name="rich_text_toolbar_level"
          checked={(input.value || 'standard') === opt.value}
          onChange={() => input.onChange(opt.value)}
          label={opt.label}
        />
      ))}
    </div>
  );
};

export const QuestionRichTextFields: FC = () => (
  <>
    <FormGroup
      label={translate('Character limit')}
      space={5}
      help={translate('Leave empty for no limit.')}
    >
      <Field
        name="rich_text_char_limit"
        component={NumberField as any}
        placeholder="5000"
        min={1}
      />
    </FormGroup>
    <FormGroup label={translate('Toolbar level')} space={5}>
      <ToolbarLevelRadioField />
    </FormGroup>
  </>
);
