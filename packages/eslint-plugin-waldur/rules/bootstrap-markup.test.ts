import tsParser from '@typescript-eslint/parser';
import { RuleTester } from 'eslint';
import { describe } from 'vitest';

import noBootstrapButtonMarkup from './no-bootstrap-button-markup.js';

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

describe('no-bootstrap-button-markup', () => {
  ruleTester.run('no-bootstrap-button-markup', noBootstrapButtonMarkup as any, {
    valid: [
      // Substrings of `btn` are not the Bootstrap button class.
      { code: 'const A = () => <button className="text-btn" />;' },
      { code: 'const A = () => <button className="btn-close" />;' },
      {
        code: 'const A = () => <button className="aui-vm-order-action-btn" />;',
      },
      // Components are the recommended path, not a violation.
      { code: 'const A = () => <BaseButton className="btn" />;' },
      // Elements Bootstrap does not style as buttons.
      { code: 'const A = () => <div className="btn" />;' },
      // Nothing static to read.
      { code: 'const A = ({ c }) => <button className={c} />;' },
      { code: 'const A = ({ v }) => <button className={`btn-${v}`} />;' },
      // The wrappers themselves.
      {
        code: 'const A = () => <button className="btn" />;',
        filename: 'src/core/buttons/BaseButton.tsx',
      },
      // Link composes `btn` behind its buttonVariant prop, so it is allowlisted
      // even though the shape below is otherwise a violation.
      {
        code: "const A = ({ v }) => <a className={classNames(v && 'btn btn-' + v)} />;",
        filename: 'src/core/Link.tsx',
      },
    ],
    invalid: [
      {
        code: 'const A = () => <button type="button" className="btn btn-danger min-w-125px" />;',
        errors: [{ messageId: 'noBootstrapButtonMarkup' }],
      },
      {
        code: 'const A = () => <a className="btn btn-primary" href="/x" />;',
        errors: [{ messageId: 'noBootstrapButtonMarkup' }],
      },
      // Static quasis of a template literal still count.
      {
        code: 'const A = ({ v }) => <button className={`btn btn-${v}`} />;',
        errors: [{ messageId: 'noBootstrapButtonMarkup' }],
      },
      // classNames() string arguments and object keys.
      {
        code: 'const A = ({ on }) => <button className={classNames("btn", { "btn-sm": on })} />;',
        errors: [{ messageId: 'noBootstrapButtonMarkup' }],
      },
      {
        code: 'const A = ({ on }) => <button className={classNames({ btn: on })} />;',
        errors: [{ messageId: 'noBootstrapButtonMarkup' }],
      },
      // Both branches of a conditional are reachable.
      {
        code: 'const A = ({ on }) => <button className={on ? "btn" : "link"} />;',
        errors: [{ messageId: 'noBootstrapButtonMarkup' }],
      },
      // String concatenation contributes its literal halves — this is the
      // shape Link.tsx uses, so the allowlist above has to be doing the work.
      {
        code: "const A = ({ v }) => <a className={classNames(v && 'btn btn-' + v)} />;",
        errors: [{ messageId: 'noBootstrapButtonMarkup' }],
      },
    ],
  });
});
