import { FC } from 'react';

import { NumberGroup, RadioGroup } from '@/form';
import { translate } from '@/i18n';
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

export const QuestionRichTextFields: FC = () => (
  <>
    <NumberGroup
      name="rich_text_char_limit"
      placeholder="5000"
      min={1}
      label={translate('Character limit')}
      space={5}
      help={translate('Leave empty for no limit.')}
    />
    <RadioGroup
      name="rich_text_toolbar_level"
      label={translate('Toolbar level')}
      options={TOOLBAR_OPTIONS}
      defaultValue="standard"
      space={5}
    />
  </>
);
