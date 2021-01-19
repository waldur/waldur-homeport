import { mount } from 'enzyme';

import { formatJsx, formatJsxTemplate } from './translate';

describe('formatJsxTemplate', () => {
  it('allows to use curly braces syntax to interpolate JSX component', () => {
    const supportEmail = 'admin@example.com';
    expect(
      mount(
        formatJsxTemplate(
          'Please send an email to {supportEmail}. Thank you!',
          {
            supportEmail: <a href={`mailto:${supportEmail}`}>{supportEmail}</a>,
          },
        ),
      ),
    ).toMatchSnapshot();
  });
});

describe('formatJsx', () => {
  it('allows to use angular braces syntax to interpolate JSX component', () => {
    expect(
      mount(
        formatJsx(
          'By submitting the form you are agreeing to the <Link>Terms of Service</Link>.',
          {
            Link: (s) => <a href="example.com">{s}</a>,
          },
        ),
      ),
    ).toMatchSnapshot();
  });
});
