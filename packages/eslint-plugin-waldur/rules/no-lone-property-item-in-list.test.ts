import { RuleTester } from 'eslint';
import { parser as tsParser } from 'typescript-eslint';
import { describe } from 'vitest';

import noLonePropertyItemInList from './no-lone-property-item-in-list.js';

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

describe('no-lone-property-item-in-list', () => {
  ruleTester.run(
    'no-lone-property-item-in-list',
    noLonePropertyItemInList as any,
    {
      valid: [
        // Multiple direct items with whitespace or comments.
        {
          code: 'const A = () => <PropertyList><PropertyItem label="a" />{/* comment */}{" "}<PropertyItem label="b" /></PropertyList>;',
        },
        // Multiple typed property items.
        {
          code: 'const A = () => <PropertyList><TextProperty label="a" value="1" /><BooleanProperty label="b" value={true} /></PropertyList>;',
        },
        // Direct item plus conditional item.
        {
          code: 'const A = () => <PropertyList><PropertyItem label="a" />{extra && <PropertyItem label="b" />}</PropertyList>;',
        },
        // Direct item plus ternary alternative.
        {
          code: 'const A = () => <PropertyList><PropertyItem label="fixed" />{cond ? <PropertyItem label="a" /> : <PropertyItem label="b" />}</PropertyList>;',
        },
        // Multiple items inside fragments.
        {
          code: 'const A = () => <PropertyList><>{cond && <PropertyItem label="a" />}<PropertyItem label="b" /></></PropertyList>;',
        },
        // Ternary where one branch has multiple items.
        {
          code: 'const A = () => <PropertyList>{cond ? <><PropertyItem label="a" /><PropertyItem label="b" /></> : null}</PropertyList>;',
        },
        // Dynamic items via .map() callback.
        {
          code: 'const A = () => <PropertyList>{rows.map((r) => <PropertyItem key={r} label={r} />)}</PropertyList>;',
        },
        // Dynamic children prop.
        {
          code: 'const A = ({ children }) => <PropertyList>{children}</PropertyList>;',
        },
        // Custom component that can render multiple rows.
        {
          code: 'const A = () => <PropertyList><ReviewDetails review={review} /></PropertyList>;',
        },
        // Multiple items inside EditFieldProvider.
        {
          code: 'const A = () => <PropertyList><EditFieldProvider scope={scope} callback={cb}><StringEditField name="a" label="A" /><NumberEditField name="b" label="B" /></EditFieldProvider></PropertyList>;',
        },
        // Empty list has no lone items.
        {
          code: 'const A = () => <PropertyList></PropertyList>;',
        },
        // Rows outside a PropertyList are handled by property-item-in-list, not this rule.
        {
          code: 'const Row = () => <PropertyItem label="a" />;',
        },
        {
          code: 'const Rows = () => <><PropertyItem label="a" /><PropertyItem label="b" /></>;',
        },
        // Custom list with multiple items.
        {
          code: 'const A = () => <CustomList><PropertyItem label="a" /><PropertyItem label="b" /></CustomList>;',
          options: [{ lists: ['CustomList'] }],
        },
      ],
      invalid: [
        // Single direct PropertyItem.
        {
          code: 'const A = () => <PropertyList><PropertyItem label="a" /></PropertyList>;',
          errors: [
            {
              messageId: 'lonePropertyItem',
              data: { name: 'PropertyItem', list: 'PropertyList' },
            },
          ],
        },
        // Single PropertyList.Item with variant.
        {
          code: 'const A = () => <PropertyList variant="summary"><PropertyList.Item label="a" /></PropertyList>;',
          errors: [
            {
              messageId: 'lonePropertyItem',
              data: { name: 'PropertyList.Item', list: 'PropertyList' },
            },
          ],
        },
        // Single TextProperty.
        {
          code: 'const A = () => <PropertyList><TextProperty label="a" value="1" /></PropertyList>;',
          errors: [
            {
              messageId: 'lonePropertyItem',
              data: { name: 'TextProperty', list: 'PropertyList' },
            },
          ],
        },
        // Single DateProperty.
        {
          code: 'const A = () => <PropertyList><DateProperty label="a" value="2026-01-01" /></PropertyList>;',
          errors: [
            {
              messageId: 'lonePropertyItem',
              data: { name: 'DateProperty', list: 'PropertyList' },
            },
          ],
        },
        // Single EditField.
        {
          code: 'const A = () => <PropertyList><StringEditField name="a" label="A" /></PropertyList>;',
          errors: [
            {
              messageId: 'lonePropertyItem',
              data: { name: 'StringEditField', list: 'PropertyList' },
            },
          ],
        },
        // Single conditional item via &&.
        {
          code: 'const A = () => <PropertyList>{x && <PropertyItem label="a" />}</PropertyList>;',
          errors: [
            {
              messageId: 'lonePropertyItem',
              data: { name: 'PropertyItem', list: 'PropertyList' },
            },
          ],
        },
        // Single item inside Fragment.
        {
          code: 'const A = () => <PropertyList><Fragment><PropertyItem label="a" /></Fragment></PropertyList>;',
          errors: [
            {
              messageId: 'lonePropertyItem',
              data: { name: 'PropertyItem', list: 'PropertyList' },
            },
          ],
        },
        // Single item inside JSX fragment and conditional.
        {
          code: 'const A = () => <PropertyList><>{x && <PropertyItem label="a" />}</></PropertyList>;',
          errors: [
            {
              messageId: 'lonePropertyItem',
              data: { name: 'PropertyItem', list: 'PropertyList' },
            },
          ],
        },
        // Ternary where alternate is null.
        {
          code: 'const A = () => <PropertyList>{x ? <PropertyItem label="a" /> : null}</PropertyList>;',
          errors: [
            {
              messageId: 'lonePropertyItem',
              data: { name: 'PropertyItem', list: 'PropertyList' },
            },
          ],
        },
        // Ternary with two single items (renders at most 1 item at runtime).
        {
          code: 'const A = () => <PropertyList>{x ? <PropertyItem label="a" /> : <PropertyItem label="b" />}</PropertyList>;',
          errors: [
            {
              messageId: 'lonePropertyItem',
              data: { name: 'PropertyItem', list: 'PropertyList' },
            },
            {
              messageId: 'lonePropertyItem',
              data: { name: 'PropertyItem', list: 'PropertyList' },
            },
          ],
        },
        // Single item inside EditFieldProvider.
        {
          code: 'const A = () => <PropertyList><EditFieldProvider scope={scope} callback={cb}><StringEditField name="a" label="A" /></EditFieldProvider></PropertyList>;',
          errors: [
            {
              messageId: 'lonePropertyItem',
              data: { name: 'StringEditField', list: 'PropertyList' },
            },
          ],
        },
        // Configured custom list with single item.
        {
          code: 'const A = () => <CustomList><PropertyItem label="a" /></CustomList>;',
          options: [{ lists: ['CustomList'] }],
          errors: [
            {
              messageId: 'lonePropertyItem',
              data: { name: 'PropertyItem', list: 'CustomList' },
            },
          ],
        },
        // Configured custom item.
        {
          code: 'const A = () => <PropertyList><CustomItem label="a" /></PropertyList>;',
          options: [{ items: ['CustomItem'] }],
          errors: [
            {
              messageId: 'lonePropertyItem',
              data: { name: 'CustomItem', list: 'PropertyList' },
            },
          ],
        },
      ],
    },
  );
});
