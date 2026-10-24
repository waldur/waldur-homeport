import { RuleTester } from 'eslint';
import { parser as tsParser } from 'typescript-eslint';
import { describe } from 'vitest';

import iconButtonNeedsAccessibleName from './icon-button-needs-accessible-name.js';

const ruleTester = new RuleTester({
  languageOptions: {
    parser: tsParser,
    parserOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      ecmaFeatures: { jsx: true },
    },
  },
});

const ui = "import { BaseButton } from 'waldur-ui';";
const compact = "import { CompactEditButton } from '@/form/CompactEditButton';";

describe('icon-button-needs-accessible-name', () => {
  ruleTester.run(
    'icon-button-needs-accessible-name',
    iconButtonNeedsAccessibleName as any,
    {
      valid: [
        // A visible label names it.
        { code: `${ui} const A = () => <BaseButton label="Save" />;` },
        {
          code: `${ui} const A = () => <BaseButton label={t('Add')} iconNode={<PlusIcon />} />;`,
        },
        // The tooltip becomes the aria-label.
        {
          code: `${ui} const A = () => <BaseButton tooltip={t('Remove')} iconNode={<TrashIcon />} />;`,
        },
        {
          code: `${ui} const A = () => <BaseButton aria-label="Close" iconNode={<XIcon />} />;`,
        },
        {
          code: `${ui} const A = () => <BaseButton aria-labelledby="h" iconNode={<XIcon />} />;`,
        },
        // Spread props are trusted to carry the name.
        {
          code: `${ui} const A = (props) => <BaseButton {...props} iconNode={<XIcon />} />;`,
        },
        // Decorative copy.
        {
          code: `${ui} const A = () => <BaseButton aria-hidden="true" tabIndex={-1} iconNode={<XIcon />} />;`,
        },
        {
          code: `${compact} const A = () => <CompactEditButton tooltip={t('Edit name')} onClick={f} />;`,
        },
        {
          code: `${compact} const A = () => <CompactEditButton aria-label="Edit name" onClick={f} />;`,
        },
        // fieldName becomes the "Edit <field>" tooltip.
        {
          code: `${compact} const A = () => <CompactEditButton fieldName={t('Email')} onClick={f} />;`,
        },
        // Someone else's BaseButton, or a CompactEditButton from elsewhere.
        {
          code: "import { BaseButton } from './local'; const A = () => <BaseButton iconNode={<XIcon />} />;",
        },
        {
          code: "import { CompactEditButton } from 'other'; const A = () => <CompactEditButton />;",
        },
      ],
      invalid: [
        // fieldName names only a CompactEditButton.
        {
          code: `${ui} const A = () => <BaseButton fieldName="Email" iconNode={<XIcon />} />;`,
          errors: [{ messageId: 'unnamed' }],
        },
        {
          code: `${ui} const A = () => <BaseButton iconNode={<TrashIcon />} onClick={f} />;`,
          errors: [{ messageId: 'unnamed' }],
        },
        // A disabled reason names it only while disabled.
        {
          code: `${ui} const A = () => <BaseButton iconNode={<XIcon />} disabled={d} disabledReason="Busy" />;`,
          errors: [{ messageId: 'unnamed' }],
        },
        {
          code: `import { BaseButton as Button } from 'waldur-ui'; const A = () => <Button iconNode={<XIcon />} />;`,
          errors: [{ messageId: 'unnamed', data: { name: 'Button' } }],
        },
        // The pencil is always icon-only.
        {
          code: `${compact} const A = () => <CompactEditButton onClick={f} />;`,
          errors: [{ messageId: 'unnamed' }],
        },
        {
          code: 'import { CompactEditButton } from \'./CompactEditButton\'; const A = () => <CompactEditButton variant="secondary" />;',
          errors: [{ messageId: 'unnamed' }],
        },
      ],
    },
  );
});
