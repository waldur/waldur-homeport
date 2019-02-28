import { attachment } from '@waldur/issues/attachments/fixture';

import { formatJiraMarkup, getUrl } from './utils';

describe('JIRA markup formatter', () => {
  const test = (input, output) => expect(formatJiraMarkup(input, [attachment])).toBe(output);

  it('makes text *strong', () => {
    test('Makes text *strong*.', 'Makes text <b>strong</b>.');
  });

  it('makes text emphasis', () => {
    test('Makes text _emphasis_.', 'Makes text <i>emphasis</i>.');
  });

  it('makes text monospaced', () => {
    test('Makes text {{monospaced}}.', 'Makes text <code>monospaced</code>.');
  });

  it('linkifies text even if JIRA markup is not used explicitly', () => {
    test(
      `In particular, https://github.com/opennode/waldur-openstack/blob/develop/src/waldur_openstack/openstack_tenant/tasks.py#L138 was displayed as a broken link.`,
      // tslint:disable-next-line
      `In particular, <a href="https://github.com/opennode/waldur-openstack/blob/develop/src/waldur_openstack/openstack_tenant/tasks.py#L138">https://github.com/opennode/waldur-openstack/blob/develop/src/waldur_openstack/openstack_tenant/tasks.py#L138</a> was displayed as a broken link.`)
  });

  it('linkifies correctly', () => {
    test(
      'Kood, mis selle realiseerib on https://github.com/opennode/waldur-mastermind/blob/develop/src/waldur_openstack/openstack_tenant/backend.py#L947',
      // tslint:disable-next-line: max-line-length
      'Kood, mis selle realiseerib on <a href=\"https://github.com/opennode/waldur-mastermind/blob/develop/src/waldur_openstack/openstack_tenant/backend.py#L947\">https://github.com/opennode/waldur-mastermind/blob/develop/src/waldur_openstack/openstack_tenant/backend.py#L947</a> ',
    );
  });

  it('creates a link to an external resource', () => {
    test('See also: [http://jira.atlassian.com]',
      'See also: <a href="http://jira.atlassian.com">http://jira.atlassian.com</a>');
  });

  it('creates a link to an internal resource', () => {
    test('See also: [^panda.jpg]',
      'See also: <a href="https://example.com/media/support_attachments/panda.jpg" download>panda.jpg</a>');
  });

  it('creates a message to not founded internal resource', () => {
    test('See also: [^test.jpg]',
      'See also: Unable to find: test.jpg');
  });

  it('creates a named link to an external resource', () => {
    test('See also: [Atlassian|http://jira.atlassian.com]',
      'See also: <a href="http://jira.atlassian.com">Atlassian</a>');
  });

  it('creates an image to an internal resource', () => {
    test('See also: !panda.jpg|thumbnail!',
      'See also: <img src="https://example.com/media/support_attachments/panda.jpg" title="panda.jpg" />');
  });

  it('creates a message to not founded internal resource', () => {
    test('See also: !test.jpg|thumbnail!',
      'See also: Unable to find: test.jpg');
  });

  it('inserts line breaks', () => {
    test('Hello\nWorld', 'Hello<br/>World');
  });
});

describe('url regex', () => {
  const test = (input, output) => expect(getUrl(input)).toBe(output);

  it('getting url', () => {
    test('https://www.google.com', 'https://www.google.com');
    test('http://www.google.com', 'http://www.google.com');
    test('ftp://www.google.com', 'ftp://www.google.com');
    test('file://www.google.com', 'file://www.google.com');
    test('www.google.com', 'www.google.com');
    test('htt://www.google.com', 'www.google.com');
    test('://www.google.com', 'www.google.com');
    test('google.com', null);
  });
});
