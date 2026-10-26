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
        code: 'const A = () => <div className="min-h-[100px] px-5 mt-md-0 my-lg-0 mt-n2 flex-lg-row" />;',
      },
      // Tailwind's own classes.
      {
        code: 'const A = () => <div className="float-start lg:p-3 -mx-2 content-center h-screen tracking-wide" />;',
      },
      { code: "type C = 'vw-100';" },
      // User-facing translation string or non-class function call containing the word "timeline"
      { code: "const title = translate('Maintenance timeline');" },
      {
        code: "const A = () => <EChart exportTitle={translate('Cross-provider maintenance analytics and timeline')} />;",
      },
    ],
    invalid: [
      {
        code: 'const A = () => <div className="vh-100 px-lg-3" />;',
        errors: [
          { messageId: 'retired', data: { token: 'vh-100', hint: 'h-screen' } },
          {
            messageId: 'retired',
            data: {
              token: 'px-lg-3',
              hint: 'a Tailwind breakpoint variant (lg:p-3, md:min-h-[100px])',
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
    ],
  });
});
