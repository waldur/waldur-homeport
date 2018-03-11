import { formatJiraMarkup, getUrl } from './utils';

describe('JIRA markup formatter', () => {
  const test = (input, output) => expect(formatJiraMarkup(input)).toBe(output);

  it('makes text *strong', () => {
    test('Makes text *strong*.', 'Makes text <b>strong</b>.');
  });

  it('makes text emphasis', () => {
    test('Makes text _emphasis_.', 'Makes text <i>emphasis</i>.');
  });

  it('makes text monospaced', () => {
    test('Makes text {{monospaced}}.', 'Makes text <code>monospaced</code>.');
  });

  it('creates a link to an external resource', () => {
    test('See also: [http://jira.atlassian.com]',
      'See also: <a href="http://jira.atlassian.com" download="false">http://jira.atlassian.com</a>');
  });

  it('creates a named link to an external resource', () => {
    test('See also: [Atlassian|http://jira.atlassian.com]',
      'See also: <a href="http://jira.atlassian.com" download="false">Atlassian</a>');
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
