import tsParser from '@typescript-eslint/parser';
import { RuleTester } from 'eslint';
import { describe } from 'vitest';

import checkNeedsAccessibleName from './check-needs-accessible-name.js';

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

const ui = "import { Checkbox, Radio, Switch } from 'waldur-ui';";

describe('check-needs-accessible-name', () => {
  ruleTester.run(
    'check-needs-accessible-name',
    checkNeedsAccessibleName as any,
    {
      valid: [
        { code: `${ui} const A = () => <Switch label="Verify SSL" />;` },
        { code: `${ui} const A = () => <Checkbox aria-label="Select row" />;` },
        { code: `${ui} const A = () => <Radio aria-labelledby="heading" />;` },
        // description or tooltip turn on the labelled row, which names the control.
        { code: `${ui} const A = () => <Switch description="Daily" />;` },
        // Props spread onto the control are trusted to carry the name.
        { code: `${ui} const A = (props) => <Checkbox {...props} />;` },
        // Not the waldur-ui control, or not a control at all.
        {
          code: "import { Switch } from 'somewhere-else'; const A = () => <Switch />;",
        },
        { code: `${ui} const A = () => <div />;` },
        // Wrapped in a <label>, which names it implicitly.
        {
          code: `${ui} const A = () => <label><Checkbox checked /> Merge</label>;`,
        },
        // A decorative copy hidden from assistive technology.
        {
          code: `${ui} const A = () => <Checkbox aria-hidden="true" readOnly />;`,
        },
        {
          code: 'import { SwitchField } from \'./SwitchField\'; const A = () => <SwitchField input={i} label="x" />;',
        },
      ],
      invalid: [
        {
          code: `${ui} const A = () => <Switch checked onCheckedChange={f} />;`,
          errors: [{ messageId: 'unnamed' }],
        },
        {
          code: `${ui} const A = () => <Checkbox checked={on} />;`,
          errors: [{ messageId: 'unnamed' }],
        },
        {
          code: `${ui} const A = () => <Radio name="r" />;`,
          errors: [{ messageId: 'unnamed' }],
        },
        // Aliased import.
        {
          code: "import { Switch as Toggle } from 'waldur-ui'; const A = () => <Toggle />;",
          errors: [{ messageId: 'unnamed' }],
        },
        // The form adapter, imported by relative or alias path.
        {
          code: "import { SwitchField } from '@/form/SwitchField'; const A = () => <SwitchField input={i} />;",
          errors: [{ messageId: 'unnamed' }],
        },
        // A <div> wrapper is not a label.
        {
          code: `${ui} const A = () => <div><Checkbox checked /> Merge</div>;`,
          errors: [{ messageId: 'unnamed' }],
        },
        // An empty-string name still counts as present syntactically; a data-testid does not name it.
        {
          code: `${ui} const A = () => <Switch data-testid="x" />;`,
          errors: [{ messageId: 'unnamed' }],
        },
      ],
    },
  );
});
