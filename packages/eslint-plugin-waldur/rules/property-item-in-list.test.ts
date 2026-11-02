import { RuleTester } from 'eslint';
import { parser as tsParser } from 'typescript-eslint';
import { describe } from 'vitest';

import propertyItemInList from './property-item-in-list.js';

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

const wrappers = [
  { wrappers: ['ExpandableContainer[asTable]', 'TabbedSection.Tab[!plain]'] },
];

describe('property-item-in-list', () => {
  ruleTester.run('property-item-in-list', propertyItemInList as any, {
    valid: [
      {
        code: 'const A = () => <PropertyList><PropertyItem label="a" /></PropertyList>;',
      },
      {
        code: 'const A = () => <PropertyList variant="summary"><PropertyList.Item label="a" /></PropertyList>;',
      },
      {
        code: 'const A = () => <PropertyList><PropertyList.Section title="s"><PropertyItem label="a" /></PropertyList.Section></PropertyList>;',
      },
      {
        code: 'const A = () => <PropertyList><div><PropertyList.Section title="s"><PropertyItem label="a" /></PropertyList.Section></div></PropertyList>;',
      },
      // Through fragments, conditionals and .map() callbacks.
      {
        code: 'const A = () => <PropertyList><>{x && <PropertyItem label="a" />}</></PropertyList>;',
      },
      {
        code: 'const A = () => <PropertyList>{x ? <PropertyItem label="a" /> : null}</PropertyList>;',
      },
      {
        code: 'const A = () => <PropertyList>{rows.map((r) => <PropertyItem key={r} label={r} />)}</PropertyList>;',
      },
      {
        code: 'const A = () => <PropertyList>{rows.map((r) => { return <PropertyItem key={r} label={r} />; })}</PropertyList>;',
      },
      {
        code: 'const A = () => <PropertyList><Fragment><PropertyItem label="a" /></Fragment></PropertyList>;',
      },
      // A component returning rows hands them to its caller's list.
      {
        code: 'const Rows = () => <><PropertyItem label="a" /><PropertyItem label="b" /></>;',
      },
      { code: 'const Row = () => <PropertyItem label="a" />;' },
      {
        code: 'const Row = ({ x }) => { if (!x) return null; return <PropertyItem label="a" />; };',
      },
      {
        code: 'const Rows = ({ rows }) => <>{rows.map((r) => <PropertyItem key={r} label={r} />)}</>;',
      },
      // Placed through a prop or a variable: not followed.
      {
        code: 'const A = () => <Tabs content={<PropertyItem label="a" />} />;',
      },
      {
        code: 'const A = () => { const row = <PropertyItem label="a" />; return <div>{row}</div>; };',
      },
      // Configured wrappers.
      {
        code: 'const A = () => <ExpandableContainer asTable><PropertyItem label="a" /></ExpandableContainer>;',
        options: wrappers,
      },
      {
        code: 'const A = () => <TabbedSection.Tab id="a"><PropertyItem label="a" /></TabbedSection.Tab>;',
        options: wrappers,
      },
    ],
    invalid: [
      {
        code: 'const A = () => <div><PropertyItem label="a" /><PropertyItem label="b" /></div>;',
        errors: [
          { messageId: 'outsideList', data: { container: 'div' } },
          { messageId: 'outsideList', data: { container: 'div' } },
        ],
      },
      {
        code: 'const A = () => <ModalDialog title="x"><PropertyItem label="a" /></ModalDialog>;',
        errors: [
          { messageId: 'outsideList', data: { container: 'ModalDialog' } },
        ],
      },
      // A card is not a list.
      {
        code: 'const A = () => <PropertyCard title="x"><PropertyItem label="a" /></PropertyCard>;',
        errors: [{ messageId: 'outsideList' }],
      },
      // One item per grid cell: each cell is its own list.
      {
        code: 'const A = () => <PropertyList><div><PropertyItem label="a" /></div></PropertyList>;',
        errors: [{ messageId: 'outsideList', data: { container: 'div' } }],
      },
      {
        code: 'const A = () => <div>{rows.map((r) => <PropertyItem key={r} label={r} />)}</div>;',
        errors: [{ messageId: 'outsideList' }],
      },
      {
        code: 'const A = () => <div>{x && <><PropertyItem label="a" /></>}</div>;',
        errors: [{ messageId: 'outsideList' }],
      },
      // Wrappers only count with their condition.
      {
        code: 'const A = () => <ExpandableContainer><PropertyItem label="a" /></ExpandableContainer>;',
        options: wrappers,
        errors: [{ messageId: 'outsideList' }],
      },
      {
        code: 'const A = () => <TabbedSection.Tab id="a" plain><PropertyItem label="a" /></TabbedSection.Tab>;',
        options: wrappers,
        errors: [{ messageId: 'outsideList' }],
      },
    ],
  });
});
