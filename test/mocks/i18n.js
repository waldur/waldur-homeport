/* eslint-disable no-undef */
import { vi } from 'vitest';

vi.mock('@/i18n', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const React = require('react');
  const formatTemplate = (template, context) =>
    context
      ? template.replace(/{(.+?)}/g, (_, key) =>
          context[key] !== undefined ? context[key] : `{${key}}`,
        )
      : template;

  return {
    translate: vi.fn((template, context, interpolator = formatTemplate) =>
      interpolator(template, context),
    ),
    formatJsx: vi.fn((template, context) => {
      const pattern = /<([^>]+)>([^<]*)<\/([^>]+)>/g;
      const parts = [];
      let matches,
        prevIndex = 0;
      while ((matches = pattern.exec(template)) !== null) {
        parts.push(template.substring(prevIndex, matches.index));
        parts.push(context[matches[1]](matches[2]));
        prevIndex = matches[0].length + matches.index;
      }
      if (prevIndex !== template.length) {
        parts.push(template.substring(prevIndex));
      }
      return React.createElement(
        React.Fragment,
        null,
        ...parts.map((part, index) =>
          React.createElement(React.Fragment, { key: index }, part),
        ),
      );
    }),
    formatJsxTemplate: vi.fn((template, context) => {
      if (!context) return template;
      return React.createElement(
        React.Fragment,
        null,
        ...template
          .split(/\{|\}/g)
          .map((part, index) =>
            React.createElement(
              React.Fragment,
              { key: index },
              index % 2 === 0 ? part : context[part],
            ),
          ),
      );
    }),
  };
});

vi.mock('@/i18n/LanguageUtilsService', () => ({
  LanguageUtilsService: {
    getCurrentLanguage: vi.fn(() => ({ code: 'en', label: 'English' })),
    getChoices: vi.fn(() => [{ code: 'en', label: 'English' }]),
    dictionary: {},
  },
  getUserLocale: vi.fn(() => 'en'),
  numberFormatter: {
    format: vi.fn((val) => val.toString()),
  },
}));
