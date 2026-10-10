import tsParser from '@typescript-eslint/parser';
import { RuleTester } from 'eslint';
import { describe } from 'vitest';

import noBootstrapTabs from './no-bootstrap-tabs.js';

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

describe('no-bootstrap-tabs', () => {
  ruleTester.run('no-bootstrap-tabs', noBootstrapTabs as any, {
    valid: [
      {
        code: "import { Tabs, TabsList } from 'waldur-ui'; const A = () => <Tabs><TabsList /></Tabs>;",
      },
      {
        code: "import { TabNav, TabNavItem } from 'waldur-ui'; const A = () => <TabNav />;",
      },
      // Other react-bootstrap components are not affected.
      { code: "import { Card, Col, Row } from 'react-bootstrap';" },
      // Lookalike class names that are not the Bootstrap classes.
      { code: 'const A = () => <div className="btn-nav-item" />;' },
      { code: 'const A = () => <div className="navigation nav-bar-x" />;' },
      // waldur-ui's own Tabs wraps Radix.
      {
        code: "import * as TabsPrimitive from '@radix-ui/react-tabs';",
        filename: '/repo/packages/ui/src/Tabs/Tabs.tsx',
      },
      // `tab-content` stays as a styling hook for `.card-body` rules.
      { code: 'const A = () => <div className="tab-content" />;' },
    ],
    invalid: [
      {
        code: "import * as Tabs from '@radix-ui/react-tabs';",
        filename: '/repo/src/auth/SigninForm.tsx',
        errors: [{ messageId: 'noRadixTabs' }],
      },
      {
        code: "import { Nav } from 'react-bootstrap';",
        errors: [{ messageId: 'noTabsImport' }],
      },
      {
        code: "import { Card, Tab, Tabs } from 'react-bootstrap';",
        errors: [{ messageId: 'noTabsImport' }, { messageId: 'noTabsImport' }],
      },
      {
        code: "import Tabs from 'react-bootstrap/Tabs';",
        errors: [{ messageId: 'noTabsImport' }],
      },
      {
        code: 'const A = () => <ul className="nav nav-tabs nav-line-tabs" />;',
        errors: [{ messageId: 'noNavClass' }],
      },
      {
        code: 'const A = () => <button className="nav-link active" />;',
        errors: [{ messageId: 'noNavClass' }],
      },
      {
        code: 'const A = () => <ul className="d-flex nav-pills" />;',
        errors: [{ messageId: 'noNavClass' }],
      },
      {
        code: "const A = () => <ul className={classNames('nav-item', x)} />;",
        errors: [{ messageId: 'noNavClass' }],
      },
    ],
  });
});
