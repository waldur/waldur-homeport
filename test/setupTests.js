import '@testing-library/jest-dom/vitest';
import 'vitest-location-mock';
import { vi } from 'vitest';

const mockModalActions = {
  openDialog: vi.fn(),
  closeDialog: vi.fn(),
  confirm: vi.fn().mockResolvedValue(undefined),
  modalComponent: null,
  modalProps: {},
  confirmComponent: null,
  confirmProps: {},
};

vi.mock('@/modal/actions', () => ({
  useModal: vi.fn(() => mockModalActions),
  ModalService: {
    open: mockModalActions.openDialog,
    close: mockModalActions.closeDialog,
    confirm: mockModalActions.confirm,
  },
}));

vi.mock('@/workspace/hooks', () => ({
  useUser: vi.fn().mockReturnValue({}),
  useCustomer: vi.fn().mockReturnValue({}),
  useProject: vi.fn().mockReturnValue({}),
  useSetUser: vi.fn().mockReturnValue(vi.fn()),
}));

vi.mock('@/marketplace/orders/actions/selectors', () => ({
  checkOrderCanBeApproved: vi.fn().mockReturnValue(true),
  orderCanBeApproved: vi.fn().mockReturnValue(true),
}));

vi.mock('@/i18n', () => {
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
