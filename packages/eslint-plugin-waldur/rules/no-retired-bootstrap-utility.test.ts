import { RuleTester } from 'eslint';
import { parser as tsParser } from 'typescript-eslint';
import { describe } from 'vitest';

import rule from './no-retired-bootstrap-utility.js';

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

describe('no-retired-bootstrap-utility', () => {
  ruleTester.run('no-retired-bootstrap-utility', rule as any, {
    valid: [
      // Still generated: base sizes, and the responsive utilities in use.
      {
        code: 'const A = () => <div className="min-h-[100px] px-5 flex-lg-row" />;',
      },
      // Tailwind's own classes.
      {
        code: 'const A = () => <div className="float-start lg:p-3 -mx-2 content-center h-screen tracking-wide" />;',
      },
      { code: "type C = 'vw-100';" },
      // A retired spacing family's plain names are Tailwind's.
      {
        code: 'const A = () => <div className="gap-3 md:gap-1.5 my-2 -m-1" />;',
      },
      // User-facing translation string or non-class function call containing the word "timeline"
      { code: "const title = translate('Maintenance timeline');" },
      {
        code: "const A = () => <EChart exportTitle={translate('Cross-provider maintenance analytics and timeline')} />;",
      },
    ],
    invalid: [
      // Spellings only Bootstrap's spacing scale had, with the Tailwind class.
      {
        code: "const c = cn('gap-md-4', 'gap-8px');",
        errors: [
          {
            messageId: 'retired',
            data: { token: 'gap-md-4', hint: 'md:gap-3' },
          },
          { messageId: 'retired', data: { token: 'gap-8px', hint: 'gap-2' } },
        ],
      },
      {
        code: 'const A = () => <div className="my-lg-0 m-n2 mt-md-0 me-n2 mb-lg-5" />;',
        errors: [
          { messageId: 'retired', data: { token: 'my-lg-0', hint: 'lg:my-0' } },
          { messageId: 'retired', data: { token: 'm-n2', hint: '-m-1.5' } },
          { messageId: 'retired', data: { token: 'mt-md-0', hint: 'md:mt-0' } },
          { messageId: 'retired', data: { token: 'me-n2', hint: '-me-1.5' } },
          { messageId: 'retired', data: { token: 'mb-lg-5', hint: 'lg:mb-4' } },
        ],
      },
      {
        code: 'const A = () => <div className="vh-100 px-lg-3" />;',
        errors: [
          { messageId: 'retired', data: { token: 'vh-100', hint: 'h-screen' } },
          {
            messageId: 'retired',
            data: {
              token: 'px-lg-3',
              hint: 'lg:px-2.5',
            },
          },
        ],
      },
      {
        code: "const c = cn('mx-n2', 'mt-lg-n1', 'flex-md-fill', 'align-content-center', 'ls-2', 'lh-1', 'lh-sm');",
        errors: [
          { messageId: 'retired' },
          { messageId: 'retired' },
          { messageId: 'retired' },
          { messageId: 'retired' },
          { messageId: 'retired' },
          { messageId: 'retired' },
          { messageId: 'retired' },
        ],
      },
      {
        code: 'const A = () => <span className="svg-icon svg-icon-2 svg-icon-5tx" />;',
        errors: [
          {
            messageId: 'retired',
            data: {
              token: 'svg-icon',
              hint: 'bare Phosphor or SVGR icon with size prop or Tailwind size-* (size-5, size-6) and text-* for color',
            },
          },
          {
            messageId: 'retired',
            data: {
              token: 'svg-icon-2',
              hint: 'bare Phosphor or SVGR icon with size prop or Tailwind size-* (size-5, size-6) and text-* for color',
            },
          },
          {
            messageId: 'retired',
            data: {
              token: 'svg-icon-5tx',
              hint: 'bare Phosphor or SVGR icon with size prop or Tailwind size-* (size-5, size-6) and text-* for color',
            },
          },
        ],
      },
      {
        code: 'const A = () => <div className="symbol symbol-circle symbol-50px symbol-label" />;',
        errors: [
          {
            messageId: 'retired',
            data: {
              token: 'symbol',
              hint: 'Avatar from waldur-ui, or Tailwind size-* and rounded-* utilities',
            },
          },
          {
            messageId: 'retired',
            data: {
              token: 'symbol-circle',
              hint: 'Avatar from waldur-ui, or Tailwind size-* and rounded-* utilities',
            },
          },
          {
            messageId: 'retired',
            data: {
              token: 'symbol-50px',
              hint: 'Avatar from waldur-ui, or Tailwind size-* and rounded-* utilities',
            },
          },
          {
            messageId: 'retired',
            data: {
              token: 'symbol-label',
              hint: 'Avatar from waldur-ui, or Tailwind size-* and rounded-* utilities',
            },
          },
        ],
      },
      {
        code: 'const A = () => <div className="timeline timeline-item timeline-line timeline-icon timeline-content timeline-border-dashed" />;',
        errors: [
          {
            messageId: 'retired',
            data: {
              token: 'timeline',
              hint: 'waldur-ui Timeline primitive (<Timeline>, <TimelineItem>, <TimelineConnector>, <TimelineIcon>, <TimelineContent>) or Tailwind flex layout',
            },
          },
          {
            messageId: 'retired',
            data: {
              token: 'timeline-item',
              hint: 'waldur-ui Timeline primitive (<Timeline>, <TimelineItem>, <TimelineConnector>, <TimelineIcon>, <TimelineContent>) or Tailwind flex layout',
            },
          },
          {
            messageId: 'retired',
            data: {
              token: 'timeline-line',
              hint: 'waldur-ui Timeline primitive (<Timeline>, <TimelineItem>, <TimelineConnector>, <TimelineIcon>, <TimelineContent>) or Tailwind flex layout',
            },
          },
          {
            messageId: 'retired',
            data: {
              token: 'timeline-icon',
              hint: 'waldur-ui Timeline primitive (<Timeline>, <TimelineItem>, <TimelineConnector>, <TimelineIcon>, <TimelineContent>) or Tailwind flex layout',
            },
          },
          {
            messageId: 'retired',
            data: {
              token: 'timeline-content',
              hint: 'waldur-ui Timeline primitive (<Timeline>, <TimelineItem>, <TimelineConnector>, <TimelineIcon>, <TimelineContent>) or Tailwind flex layout',
            },
          },
          {
            messageId: 'retired',
            data: {
              token: 'timeline-border-dashed',
              hint: 'waldur-ui Timeline primitive (<Timeline>, <TimelineItem>, <TimelineConnector>, <TimelineIcon>, <TimelineContent>) or Tailwind flex layout',
            },
          },
        ],
      },
      {
        code: 'const A = () => <div className="spinner-border spinner-border-sm spinner-grow spinner-grow-sm" />;',
        errors: [
          {
            messageId: 'retired',
            data: {
              token: 'spinner-border',
              hint: "waldur-ui's LoadingSpinner component",
            },
          },
          {
            messageId: 'retired',
            data: {
              token: 'spinner-border-sm',
              hint: "waldur-ui's LoadingSpinner component",
            },
          },
          {
            messageId: 'retired',
            data: {
              token: 'spinner-grow',
              hint: "waldur-ui's LoadingSpinner component",
            },
          },
          {
            messageId: 'retired',
            data: {
              token: 'spinner-grow-sm',
              hint: "waldur-ui's LoadingSpinner component",
            },
          },
        ],
      },
    ],
  });
});
