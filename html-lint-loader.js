const regexp = new RegExp('<([^> ]+)\\s*[^>]*?/>', 'mg');

const selfClosingInlineTags = [
  'area',
  'base',
  'br',
  'col',
  'embed',
  'hr',
  'img',
  'input',
  'keygen',
  'link',
  'menuitem',
  'meta',
  'param',
  'source',
  'track',
  'wbr',
];

module.exports = function(content) {
  this.cacheable && this.cacheable();

  let match;
  while ((match = regexp.exec(content)) != null) {
    const tag = match[1].trim();
    if (!selfClosingInlineTags.includes(tag)) {
      throw new Error(`Self-closing element ${tag} is not allowed.`);
    }
  }

  return content;
};
