import { RuleTester } from 'eslint';
import { parser as tsParser } from 'typescript-eslint';
import { describe } from 'vitest';

import rule from './no-unknown-class.js';

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

const unknown = (token: string, hint = '') => ({
  messageId: 'unknown',
  data: { token, hint },
});

describe('no-unknown-class', () => {
  ruleTester.run('no-unknown-class', rule as any, {
    valid: [
      // Tailwind: variants, arbitrary values, important, opacity, theme tokens.
      {
        code: 'const A = () => <div className="flex gap-4 md:hidden hover:bg-primary mt-[3px] !p-2 p-2! text-primary/50 grid-cols-[1fr_auto] text-tertiary" />;',
      },
      // Classes from the compiled SCSS (Bootstrap grid, Metronic card).
      {
        code: 'const A = () => <div className="row col-md-6 card-bordered" />;',
      },
      // group / peer markers emit no CSS of their own.
      {
        code: 'const A = () => <div className="group group/item peer"><span className="group-hover:underline" /></div>;',
      },
      // A token glued to an expression is a fragment, not a class.
      { code: 'const A = ({ t }) => <div className={`text-${t} flex`} />;' },
      // Strings outside class positions are not class lists.
      { code: "const label = 'flx gap-44x';" },
      { code: 'const A = () => <Badge variant="sizzle" title="felx" />;' },
      // cva: variant names and defaultVariants are not classes.
      {
        code: "const b = cva('flex', { variants: { size: { huge: 'p-4' } }, defaultVariants: { size: 'huge' }, compoundVariants: [{ size: 'huge', className: 'gap-2' }] });",
      },
      // The left of `&&` is a condition, even when it is a const string.
      {
        code: "const label = 'Open'; const A = () => <div className={label && 'flex'} />;",
      },
      // A const glued to text in a template literal is a fragment.
      {
        code: "const tone = 'danger'; const A = () => <div className={`text-${tone}`} />;",
      },
      // Only the entry read from a const map is checked.
      {
        code: "const TONE = { ok: 'nope-1', danger: 'text-danger' }; const A = () => <div className={TONE.danger} />;",
      },
      // Objects met by name only are not class maps.
      {
        code: "const LABEL_CLASSES = { draft: 'info' }; const A = ({ s }) => <Badge variant={LABEL_CLASSES[s]} />;",
      },
      {
        code: "const meta = { argTypes: { className: { control: 'text' } } };",
      },
      // Explicitly allowed hook classes.
      {
        code: 'const A = () => <div className="js-drop-target" />;',
        options: [{ allow: ['^js-'] }],
      },
    ],
    invalid: [
      {
        code: 'const A = () => <div className="flex felx" />;',
        errors: [unknown('felx', ' Did you mean "flex"?')],
      },
      {
        code: 'const A = () => <div className="md:hiden" />;',
        errors: [unknown('md:hiden', ' Did you mean "md:hidden"?')],
      },
      // Tailwind has no ring colour for the brand token.
      {
        code: 'const A = () => <button className="focus-visible:ring-brand" />;',
        errors: [{ messageId: 'unknown' }],
      },
      // Helpers, *ClassName props, class variables, template literals.
      {
        code: "const A = ({ on }) => <div className={cn('flex', on && 'gap-44x', { 'bg-nope': on })} />;",
        errors: [{ messageId: 'unknown' }, { messageId: 'unknown' }],
      },
      {
        code: 'const A = () => <Field containerClassName="text-teritary" />;',
        errors: [{ messageId: 'unknown' }],
      },
      {
        code: "const buttonClasses = 'flex justify-centre';",
        errors: [{ messageId: 'unknown' }],
      },
      {
        code: 'const A = ({ t }) => <div className={`text-${t} itms-center`} />;',
        errors: [{ messageId: 'unknown' }],
      },
      {
        code: "const b = cva('flex', { variants: { size: { sm: 'h-8 px-22x' } } });",
        errors: [{ messageId: 'unknown' }],
      },
      // Upper-case class constants.
      {
        code: "export const BASE_CLASSNAME = 'flx gap-2';",
        errors: [unknown('flx', ' Did you mean "flex"?')],
      },
      // A const followed from a class position, whatever its name.
      {
        code: "const BASE = 'flx'; const A = () => <div className={BASE} />;",
        errors: [unknown('flx', ' Did you mean "flex"?')],
      },
      // Every value of a const map indexed by a variable.
      {
        code: "const SIZES = { sm: 'h-8 px-22x', lg: 'h-12' } as const; const A = ({ s }) => <div className={cn('flex', SIZES[s])} />;",
        errors: [{ messageId: 'unknown' }],
      },
      {
        code: "const TONE = { ok: 'text-success', danger: 'nope-2' }; const A = () => <div className={TONE.danger} />;",
        errors: [{ messageId: 'unknown' }],
      },
      // An expression standing alone in a template literal.
      {
        code: "const A = ({ on }) => <div className={`flex ${on ? 'flx-col' : ''}`} />;",
        errors: [unknown('flx-col', ' Did you mean "flex-col"?')],
      },
    ],
  });
});
