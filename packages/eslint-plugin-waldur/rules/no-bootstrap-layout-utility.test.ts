import { RuleTester } from 'eslint';
import { parser as tsParser } from 'typescript-eslint';
import { describe } from 'vitest';

import rule from './no-bootstrap-layout-utility.js';

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

describe('no-bootstrap-layout-utility', () => {
  ruleTester.run('no-bootstrap-layout-utility', rule as any, {
    valid: [
      {
        code: 'const A = () => <div className="flex block hidden inline-flex grid flex-col items-center justify-between grow shrink-0 w-full h-full truncate md:hidden lg:flex" />;',
      },
      {
        code: 'const A = () => <div className="w-10 w-28 w-32 min-w-26 min-w-28 h-11 h-6 w-0 w-auto h-auto min-h-auto min-w-auto" />;',
      },
      {
        code: "const A = () => <div className={cn('hover:items-center', 'md:justify-between')} />;",
      },
      // Non-class lists
      { code: "type D = 'd-flex';" },
      { code: "const o = { variant: 'd-flex' };" },
      { code: "const isFlex = cls === 'd-flex';" },
    ],
    invalid: [
      {
        // Bootstrap's !important .flex-wrap beats sm:flex-nowrap: no autofix.
        code: 'const A = () => <div className="d-flex flex-wrap flex-sm-nowrap" />;',
        output:
          'const A = () => <div className="flex flex-wrap flex-sm-nowrap" />;',
        errors: [
          { messageId: 'layoutUtility' },
          {
            messageId: 'wrapConflict',
            data: {
              token: 'flex-sm-nowrap',
              base: 'flex-wrap',
              fix: 'sm:flex-nowrap',
              alternative: 'max-sm:flex-wrap',
            },
          },
        ],
      },
      {
        code: 'const A = () => <div className="flex-nowrap flex-md-wrap" />;',
        output: null,
        errors: [
          {
            messageId: 'wrapConflict',
            data: {
              token: 'flex-md-wrap',
              base: 'flex-nowrap',
              fix: 'md:flex-wrap',
              alternative: 'max-md:flex-nowrap',
            },
          },
        ],
      },
      {
        code: 'const A = () => <div className="d-flex" />;',
        output: 'const A = () => <div className="flex" />;',
        errors: [
          {
            messageId: 'layoutUtility',
            data: { token: 'd-flex', fix: 'flex' },
          },
        ],
      },
      {
        code: 'const A = () => <div className="d-block d-none d-inline d-inline-block d-inline-flex d-grid" />;',
        output:
          'const A = () => <div className="block hidden inline inline-block inline-flex grid" />;',
        errors: [
          { messageId: 'layoutUtility' },
          { messageId: 'layoutUtility' },
          { messageId: 'layoutUtility' },
          { messageId: 'layoutUtility' },
          { messageId: 'layoutUtility' },
          { messageId: 'layoutUtility' },
        ],
      },
      {
        code: 'const A = () => <div className="d-sm-flex d-md-none d-lg-block d-xxl-none" />;',
        output:
          'const A = () => <div className="sm:flex md:hidden lg:block 2xl:hidden" />;',
        errors: [
          { messageId: 'layoutUtility' },
          { messageId: 'layoutUtility' },
          { messageId: 'layoutUtility' },
          { messageId: 'layoutUtility' },
        ],
      },
      {
        code: 'const A = () => <div className="flex-column flex-column-reverse" />;',
        output:
          'const A = () => <div className="flex-col flex-col-reverse" />;',
        errors: [
          { messageId: 'layoutUtility' },
          { messageId: 'layoutUtility' },
        ],
      },
      {
        code: 'const A = () => <div className="align-items-center align-items-start align-items-end align-items-stretch align-items-baseline" />;',
        output:
          'const A = () => <div className="items-center items-start items-end items-stretch items-baseline" />;',
        errors: [
          { messageId: 'layoutUtility' },
          { messageId: 'layoutUtility' },
          { messageId: 'layoutUtility' },
          { messageId: 'layoutUtility' },
          { messageId: 'layoutUtility' },
        ],
      },
      {
        code: 'const A = () => <div className="align-self-center align-self-start align-self-end align-self-stretch align-self-auto" />;',
        output:
          'const A = () => <div className="self-center self-start self-end self-stretch self-auto" />;',
        errors: [
          { messageId: 'layoutUtility' },
          { messageId: 'layoutUtility' },
          { messageId: 'layoutUtility' },
          { messageId: 'layoutUtility' },
          { messageId: 'layoutUtility' },
        ],
      },
      {
        code: 'const A = () => <div className="justify-content-between justify-content-center justify-content-end justify-content-start justify-content-around justify-content-evenly" />;',
        output:
          'const A = () => <div className="justify-between justify-center justify-end justify-start justify-around justify-evenly" />;',
        errors: [
          { messageId: 'layoutUtility' },
          { messageId: 'layoutUtility' },
          { messageId: 'layoutUtility' },
          { messageId: 'layoutUtility' },
          { messageId: 'layoutUtility' },
          { messageId: 'layoutUtility' },
        ],
      },
      {
        code: 'const A = () => <div className="flex-fill flex-grow-1 flex-grow-0 flex-shrink-0 flex-shrink-1" />;',
        output:
          'const A = () => <div className="flex-1 grow grow-0 shrink-0 shrink" />;',
        errors: [
          {
            messageId: 'layoutUtility',
            data: { token: 'flex-fill', fix: 'flex-1' },
          },
          { messageId: 'layoutUtility' },
          { messageId: 'layoutUtility' },
          { messageId: 'layoutUtility' },
          { messageId: 'layoutUtility' },
        ],
      },
      {
        code: 'const A = () => <div className="mw-100 mh-100 text-truncate" />;',
        output:
          'const A = () => <div className="max-w-full max-h-full truncate" />;',
        errors: [
          { messageId: 'layoutUtility' },
          { messageId: 'layoutUtility' },
          { messageId: 'layoutUtility' },
        ],
      },
      {
        // Responsive flex utilities
        code: 'const A = () => <div className="flex-md-column flex-sm-row flex-md-nowrap flex-lg-fill align-items-sm-center justify-content-lg-between" />;',
        output:
          'const A = () => <div className="md:flex-col sm:flex-row md:flex-nowrap lg:flex-1 sm:items-center lg:justify-between" />;',
        errors: [
          { messageId: 'layoutUtility' },
          { messageId: 'layoutUtility' },
          { messageId: 'layoutUtility' },
          { messageId: 'layoutUtility' },
          { messageId: 'layoutUtility' },
          { messageId: 'layoutUtility' },
        ],
      },
      {
        // Tailwind variants and important modifier
        code: "const c = cn('hover:d-flex', 'd-block!');",
        output: "const c = cn('hover:flex', 'block!');",
        errors: [
          { messageId: 'layoutUtility' },
          { messageId: 'layoutUtility' },
        ],
      },
      {
        // Fixed-size pixel sizing utilities
        code: 'const A = () => <div className="w-125px min-w-125px mw-175px h-500px mh-300px min-h-60px" />;',
        output:
          'const A = () => <div className="w-[125px] min-w-[125px] max-w-[175px] h-[500px] max-h-[300px] min-h-[60px]" />;',
        errors: [
          {
            messageId: 'layoutUtility',
            data: { token: 'w-125px', fix: 'w-[125px]' },
          },
          {
            messageId: 'layoutUtility',
            data: { token: 'min-w-125px', fix: 'min-w-[125px]' },
          },
          {
            messageId: 'layoutUtility',
            data: { token: 'mw-175px', fix: 'max-w-[175px]' },
          },
          {
            messageId: 'layoutUtility',
            data: { token: 'h-500px', fix: 'h-[500px]' },
          },
          {
            messageId: 'layoutUtility',
            data: { token: 'mh-300px', fix: 'max-h-[300px]' },
          },
          {
            messageId: 'layoutUtility',
            data: { token: 'min-h-60px', fix: 'min-h-[60px]' },
          },
        ],
      },
      {
        // Percentage sizing utilities Tailwind does not define
        code: 'const A = () => <div className="mw-50 mh-50" />;',
        output: 'const A = () => <div className="max-w-1/2 max-h-1/2" />;',
        errors: [
          {
            messageId: 'layoutUtility',
            data: { token: 'mw-50', fix: 'max-w-1/2' },
          },
          {
            messageId: 'layoutUtility',
            data: { token: 'mh-50', fix: 'max-h-1/2' },
          },
        ],
      },
      {
        // Also Tailwind spacing classes: no autofix, a suggestion per reading.
        code: 'const A = () => <div className="w-50 hover:min-h-100" />;',
        output: null,
        errors: [
          {
            messageId: 'ambiguousSize',
            data: { token: 'w-50', percent: 'w-1/2', pixels: 'w-[200px]' },
            suggestions: [
              {
                messageId: 'useReplacement',
                data: { fix: 'w-1/2' },
                output:
                  'const A = () => <div className="w-1/2 hover:min-h-100" />;',
              },
              {
                messageId: 'useReplacement',
                data: { fix: 'w-[200px]' },
                output:
                  'const A = () => <div className="w-[200px] hover:min-h-100" />;',
              },
            ],
          },
          {
            messageId: 'ambiguousSize',
            data: {
              token: 'hover:min-h-100',
              percent: 'hover:min-h-full',
              pixels: 'hover:min-h-[400px]',
            },
            suggestions: [
              {
                messageId: 'useReplacement',
                data: { fix: 'hover:min-h-full' },
                output:
                  'const A = () => <div className="w-50 hover:min-h-full" />;',
              },
              {
                messageId: 'useReplacement',
                data: { fix: 'hover:min-h-[400px]' },
                output:
                  'const A = () => <div className="w-50 hover:min-h-[400px]" />;',
              },
            ],
          },
        ],
      },
      {
        code: 'const A = () => <div className="w-25 w-75 h-100 min-w-50" />;',
        output: null,
        errors: [
          {
            messageId: 'ambiguousSize',
            data: { token: 'w-25', percent: 'w-1/4', pixels: 'w-[100px]' },
            suggestions: 2,
          },
          {
            messageId: 'ambiguousSize',
            data: { token: 'w-75', percent: 'w-3/4', pixels: 'w-[300px]' },
            suggestions: 2,
          },
          {
            messageId: 'ambiguousSize',
            data: { token: 'h-100', percent: 'h-full', pixels: 'h-[400px]' },
            suggestions: 2,
          },
          {
            messageId: 'ambiguousSize',
            data: {
              token: 'min-w-50',
              percent: 'min-w-1/2',
              pixels: 'min-w-[200px]',
            },
            suggestions: 2,
          },
        ],
      },
      {
        // Responsive size utilities
        code: 'const A = () => <div className="mw-sm-25 mw-lg-200px w-sm-120px min-h-md-100px h-lg-100px w-sm-auto" />;',
        output:
          'const A = () => <div className="sm:max-w-1/4 lg:max-w-[200px] sm:w-[120px] md:min-h-[100px] lg:h-[100px] sm:w-auto" />;',
        errors: [
          {
            messageId: 'layoutUtility',
            data: { token: 'mw-sm-25', fix: 'sm:max-w-1/4' },
          },
          {
            messageId: 'layoutUtility',
            data: { token: 'mw-lg-200px', fix: 'lg:max-w-[200px]' },
          },
          {
            messageId: 'layoutUtility',
            data: { token: 'w-sm-120px', fix: 'sm:w-[120px]' },
          },
          {
            messageId: 'layoutUtility',
            data: { token: 'min-h-md-100px', fix: 'md:min-h-[100px]' },
          },
          {
            messageId: 'layoutUtility',
            data: { token: 'h-lg-100px', fix: 'lg:h-[100px]' },
          },
          {
            messageId: 'layoutUtility',
            data: { token: 'w-sm-auto', fix: 'sm:w-auto' },
          },
        ],
      },
      {
        // Table column definition
        code: "const col = { title: 'Actions', className: 'min-w-125px' };",
        output: "const col = { title: 'Actions', className: 'min-w-[125px]' };",
        errors: [
          {
            messageId: 'layoutUtility',
            data: { token: 'min-w-125px', fix: 'min-w-[125px]' },
          },
        ],
      },
      {
        // Unset sizing
        code: 'const A = () => <div className="w-unset min-w-unset" />;',
        output: 'const A = () => <div className="w-[unset] min-w-[unset]" />;',
        errors: [
          {
            messageId: 'layoutUtility',
            data: { token: 'w-unset', fix: 'w-[unset]' },
          },
          {
            messageId: 'layoutUtility',
            data: { token: 'min-w-unset', fix: 'min-w-[unset]' },
          },
        ],
      },
    ],
  });
});
