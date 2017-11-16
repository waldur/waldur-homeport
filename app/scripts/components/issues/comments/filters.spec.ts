import {formatJiraMarkup} from './filters';

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
      'See also: <a href="http://jira.atlassian.com">http://jira.atlassian.com</a>');
  });

  it('creates a named link to an external resource', () => {
    test('See also: [Atlassian|http://jira.atlassian.com]',
      'See also: <a href="http://jira.atlassian.com">Atlassian</a>');
  });

  it('inserts line breaks', () => {
    test('Hello\nWorld', 'Hello<br/>World');
  });
});
