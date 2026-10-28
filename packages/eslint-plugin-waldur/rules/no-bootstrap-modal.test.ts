import { RuleTester } from 'eslint';
import { parser as tsParser } from 'typescript-eslint';
import { describe } from 'vitest';

import noBootstrapModal from './no-bootstrap-modal.js';

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

describe('no-bootstrap-modal', () => {
  ruleTester.run('no-bootstrap-modal', noBootstrapModal as any, {
    valid: [
      {
        code: 'import { ModalDialog, ModalShell } from \'waldur-ui\'; const A = () => <ModalShell open onHide={f}><ModalDialog title="T" /></ModalShell>;',
      },
      {
        code: "openDialog(D, { size: 'lg', dialogClassName: 'role-dialog' });",
      },
      { code: 'const A = () => <X dialogClassName="sm:max-w-[650px]" />;' },
      // Lookalike class names that are not the Bootstrap classes.
      { code: 'const A = () => <div className="resource-actions-modal" />;' },
      { code: "openDialog(D, { className: 'resource-actions-modal' });" },
      { code: 'const A = () => <div className="modal-passthrough:flex" />;' },
    ],
    invalid: [
      {
        code: 'const A = () => <div className="modal-body"><h5 className="modal-title" /></div>;',
        errors: [{ messageId: 'noModalClass' }, { messageId: 'noModalClass' }],
      },
      {
        code: 'const A = () => <button className="btn-close ms-2" />;',
        errors: [{ messageId: 'noModalClass' }],
      },
      {
        code: 'const A = () => <X dialogClassName="modal-md modal-dialog-centered" />;',
        errors: [{ messageId: 'noModalClass' }],
      },
      {
        code: "openDialog(D, { dialogClassName: 'modal-dialog-centered mw-650px' });",
        errors: [{ messageId: 'noModalClass' }],
      },
    ],
  });
});
