import { render } from '@testing-library/react';
import { describe, it, expect, afterEach } from 'vitest';

import { LanguageUtilsService } from './languageUtils';
import {
  formatJsx,
  formatJsxTemplate,
  setMessageTransform,
  translate,
} from './translate';

describe('formatJsxTemplate', () => {
  it('allows to use curly braces syntax to interpolate JSX component', () => {
    const supportEmail = 'admin@example.com';
    const { container } = render(
      formatJsxTemplate('Please send an email to {supportEmail}. Thank you!', {
        supportEmail: <a href={`mailto:${supportEmail}`}>{supportEmail}</a>,
      }),
    );
    expect(container).toMatchSnapshot();
  });
});

describe('formatJsx', () => {
  it('allows to use angular braces syntax to interpolate JSX component', () => {
    const { container } = render(
      formatJsx(
        'By submitting the form you are agreeing to the <Link>Terms of Service</Link>.',
        {
          Link: (s) => <a href="example.com">{s}</a>,
        },
      ),
    );
    expect(container).toMatchSnapshot();
  });
});

describe('translate', () => {
  afterEach(() => {
    setMessageTransform((message) => message);
    LanguageUtilsService.dictionary = {};
  });

  it('returns the template unchanged when nothing is in the dictionary', () => {
    expect(translate('Hello world')).toBe('Hello world');
  });

  it('looks up the current dictionary before interpolating', () => {
    LanguageUtilsService.dictionary = { 'Hello {name}': 'Bonjour {name}' };
    expect(translate('Hello {name}', { name: 'Ada' })).toBe('Bonjour Ada');
  });

  it('runs the message transform before dictionary lookup', () => {
    LanguageUtilsService.dictionary = { Catalog: 'Katalog' };
    setMessageTransform((message) =>
      message === 'Marketplace' ? 'Catalog' : message,
    );
    expect(translate('Marketplace')).toBe('Katalog');
  });

  it('uses a custom interpolator when provided', () => {
    const upperInterpolator = (template: string) => template.toUpperCase();
    expect(translate('shout', undefined, upperInterpolator)).toBe('SHOUT');
  });
});
