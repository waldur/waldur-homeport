import tsParser from '@typescript-eslint/parser';
import { RuleTester } from 'eslint';
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
        code: 'const A = () => <div className="w-100 h-100 mw-100 mh-100 text-truncate" />;',
        output:
          'const A = () => <div className="w-full h-full max-w-full max-h-full truncate" />;',
        errors: [
          { messageId: 'layoutUtility' },
          { messageId: 'layoutUtility' },
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
    ],
  });
});
