import tsParser from '@typescript-eslint/parser';
import { RuleTester } from 'eslint';
import { describe } from 'vitest';

import enforceDialogButtonOrder from './enforce-dialog-button-order.js';

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

describe('enforce-dialog-button-order', () => {
  ruleTester.run(
    'enforce-dialog-button-order',
    enforceDialogButtonOrder as any,
    {
      valid: [
        // Standard CloseDialogButton then SubmitButton
        {
          code: `
          const A = () => (
            <ModalDialog
              footer={
                <>
                  <CloseDialogButton />
                  <SubmitButton label="Save" />
                </>
              }
            />
          );
        `,
        },
        // Single CloseDialogButton
        {
          code: `
          const A = () => (
            <ModalDialog
              footer={<CloseDialogButton label="Close" />}
            />
          );
        `,
        },
        // Single SubmitButton
        {
          code: `
          const A = () => (
            <ModalDialog
              footer={<SubmitButton label="Create" />}
            />
          );
        `,
        },
        // FormFooter component
        {
          code: `
          const A = () => (
            <ModalDialog
              footer={<FormFooter submitLabel="Submit" />}
            />
          );
        `,
        },
        // Wizard navigation: Back, Cancel, Submit
        {
          code: `
          const A = () => (
            <ModalDialog
              footer={
                <>
                  <SubmitButton type="button" variant="tertiary" label="Back" />
                  <CloseDialogButton />
                  <SubmitButton label="Next" />
                </>
              }
            />
          );
        `,
        },
        // Modal.Footer with Cancel then Apply
        {
          code: `
          const A = () => (
            <Modal.Footer>
              <Button variant="secondary">Cancel</Button>
              <Button variant="primary">Apply</Button>
            </Modal.Footer>
          );
        `,
        },
        // CloseDialogButton then Reject then Approve
        {
          code: `
          const A = () => (
            <ModalDialog
              footer={
                <>
                  <CloseDialogButton />
                  <CompactSubmitButton variant="danger" label="Reject" />
                  <CompactSubmitButton variant="success" label="Approve" />
                </>
              }
            />
          );
        `,
        },
      ],
      invalid: [
        // SubmitButton before CloseDialogButton
        {
          code: `
          const A = () => (
            <ModalDialog
              footer={
                <>
                  <SubmitButton label="Save" />
                  <CloseDialogButton />
                </>
              }
            />
          );
        `,
          output: `
          const A = () => (
            <ModalDialog
              footer={
                <>
                  <CloseDialogButton />
                  <SubmitButton label="Save" />
                </>
              }
            />
          );
        `,
          errors: [{ messageId: 'invalidButtonOrder' }],
        },
        // SubmitButton with children before CloseDialogButton
        {
          code: `
          const A = () => (
            <ModalDialog
              footer={
                <>
                  <SubmitButton>Save</SubmitButton>
                  <CloseDialogButton />
                </>
              }
            />
          );
        `,
          output: `
          const A = () => (
            <ModalDialog
              footer={
                <>
                  <CloseDialogButton />
                  <SubmitButton>Save</SubmitButton>
                </>
              }
            />
          );
        `,
          errors: [{ messageId: 'invalidButtonOrder' }],
        },
        // BaseButton(primary) before CloseDialogButton inside a div
        {
          code: `
          const A = () => (
            <ModalDialog
              footer={
                <div className="d-flex gap-2">
                  <BaseButton variant="primary" label="Download" />
                  <CloseDialogButton label="Close" />
                </div>
              }
            />
          );
        `,
          output: `
          const A = () => (
            <ModalDialog
              footer={
                <div className="d-flex gap-2">
                  <CloseDialogButton label="Close" />
                  <BaseButton variant="primary" label="Download" />
                </div>
              }
            />
          );
        `,
          errors: [{ messageId: 'invalidButtonOrder' }],
        },
        // Modal.Footer with primary button before secondary/cancel
        {
          code: `
          const A = () => (
            <Modal.Footer>
              <Button variant="primary">Submit</Button>
              <Button variant="secondary">Cancel</Button>
            </Modal.Footer>
          );
        `,
          output: `
          const A = () => (
            <Modal.Footer>
              <Button variant="secondary">Cancel</Button>
              <Button variant="primary">Submit</Button>
            </Modal.Footer>
          );
        `,
          errors: [{ messageId: 'invalidButtonOrder' }],
        },
      ],
    },
  );
});
