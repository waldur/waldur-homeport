// This is a list of words that should not be lowercased
const EXCEPTIONS: Record<string, string> = {
  url: 'URL',
  id: 'ID',
  api: 'API',
  eessi: 'EESSI',
  tos: 'ToS',
  // Acronyms in setting keys ("COI_DETECTION_ENABLED"), which settings pages
  // title from the key.
  acl: 'ACL',
  ai: 'AI',
  coi: 'COI',
  html: 'HTML',
  idp: 'IdP',
  k8s: 'K8s',
  mcp: 'MCP',
  oidc: 'OIDC',
  orcid: 'ORCID',
  otlp: 'OTLP',
  posix: 'POSIX',
  rsa: 'RSA',
  scim: 'SCIM',
  sram: 'SRAM',
  ssh: 'SSH',
  ssl: 'SSL',
  sso: 'SSO',
  ttl: 'TTL',
  uri: 'URI',
  urls: 'URLs',
  urn: 'URN',
  vat: 'VAT',
};

export const titleCase = (input: string) => {
  if (!input) return input;

  const words = input
    .split(' ')
    .map((word) => EXCEPTIONS[word.toLowerCase()] || word.toLowerCase());

  // Capitalize only the first word
  words[0] = words[0].charAt(0).toUpperCase() + words[0].slice(1);

  return words.join(' ');
};
