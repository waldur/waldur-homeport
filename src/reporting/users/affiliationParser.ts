import { translate } from '@/i18n';

/**
 * Generic Affiliation URN Parser
 *
 * Handles multiple URN formats:
 * - MACE: urn:mace:<authority>:<namespace>:<attribute>:<value>
 * - SCHAC: urn:schac:<attribute>:<scope>:<type>:<value>
 * - OID: urn:oid:<oid-path>
 * - Generic URN: urn:<nid>:<nss>
 *
 * @see https://incommon.org/community/mace-registries/mace-urn-registry/
 * @see https://help.switch.ch/aai/support/documents/attributes/schachomeorganizationtype/
 * @see https://wiki.refeds.org/display/STAN/SCHAC
 */

export interface ParsedAffiliation {
  /** Original URN/value string */
  raw: string;
  /** URN namespace (mace, schac, oid, etc.) */
  namespace: string | null;
  /** Authority/registry (e.g., terena.org, incommon.org) */
  authority: string | null;
  /** Attribute type (e.g., homeOrganization, personalUniqueCode) */
  attributeType: string | null;
  /** Human-readable attribute type label */
  attributeTypeLabel: string;
  /** Scope (e.g., int, eu, country code) */
  scope: string | null;
  /** Country code (extracted from domain or scope) */
  country: string | null;
  /** Human-readable country name */
  countryLabel: string;
  /** Organization domain */
  organization: string | null;
  /** Additional identifier */
  identifier: string | null;
  /** Human-readable display name */
  displayName: string;
  /** Categorized type for filtering */
  category: AffiliationCategory;
  /** Human-readable category label */
  categoryLabel: string;
}

export type AffiliationCategory =
  | 'home-organization'
  | 'personal-identifier'
  | 'organization-type'
  | 'user-status'
  | 'eduperson'
  | 'other';

/**
 * Category labels
 */
const CATEGORY_LABELS: Record<AffiliationCategory, () => string> = {
  'home-organization': () => translate('Home organization'),
  'personal-identifier': () => translate('Personal identifier'),
  'organization-type': () => translate('Organization type'),
  'user-status': () => translate('User status'),
  eduperson: () => translate('eduPerson affiliation'),
  other: () => translate('Other'),
};

/**
 * Known attribute type labels
 */
const ATTRIBUTE_LABELS: Record<string, () => string> = {
  homeorganization: () => translate('Home organization'),
  homeorganizationtype: () => translate('Organization type'),
  personaluniquecode: () => translate('Personal unique code'),
  personaluniqueid: () => translate('Personal unique ID'),
  userstatus: () => translate('User status'),
  edupersonaffiliation: () => translate('eduPerson affiliation'),
  edupersonprimaryaffiliation: () => translate('Primary affiliation'),
  edupersonscopedaffiliation: () => translate('Scoped affiliation'),
  edupersonprincipalname: () => translate('Principal name'),
  edupersontargetedid: () => translate('Targeted ID'),
  edupersonentitlement: () => translate('Entitlement'),
  edupersonorcid: () => translate('ORCID'),
};

/**
 * Country code to name mapping
 */
const COUNTRY_NAMES: Record<string, () => string> = {
  // Europe
  at: () => translate('Austria'),
  be: () => translate('Belgium'),
  bg: () => translate('Bulgaria'),
  ch: () => translate('Switzerland'),
  cy: () => translate('Cyprus'),
  cz: () => translate('Czech Republic'),
  de: () => translate('Germany'),
  dk: () => translate('Denmark'),
  ee: () => translate('Estonia'),
  es: () => translate('Spain'),
  fi: () => translate('Finland'),
  fr: () => translate('France'),
  gr: () => translate('Greece'),
  hr: () => translate('Croatia'),
  hu: () => translate('Hungary'),
  ie: () => translate('Ireland'),
  is: () => translate('Iceland'),
  it: () => translate('Italy'),
  li: () => translate('Liechtenstein'),
  lt: () => translate('Lithuania'),
  lu: () => translate('Luxembourg'),
  lv: () => translate('Latvia'),
  mt: () => translate('Malta'),
  nl: () => translate('Netherlands'),
  no: () => translate('Norway'),
  pl: () => translate('Poland'),
  pt: () => translate('Portugal'),
  ro: () => translate('Romania'),
  se: () => translate('Sweden'),
  si: () => translate('Slovenia'),
  sk: () => translate('Slovakia'),
  uk: () => translate('United Kingdom'),
  gb: () => translate('United Kingdom'),
  // International/Regional
  eu: () => translate('European Union'),
  int: () => translate('International'),
  // Americas
  us: () => translate('United States'),
  ca: () => translate('Canada'),
  mx: () => translate('Mexico'),
  br: () => translate('Brazil'),
  ar: () => translate('Argentina'),
  cl: () => translate('Chile'),
  co: () => translate('Colombia'),
  // Asia-Pacific
  au: () => translate('Australia'),
  nz: () => translate('New Zealand'),
  jp: () => translate('Japan'),
  cn: () => translate('China'),
  kr: () => translate('South Korea'),
  tw: () => translate('Taiwan'),
  sg: () => translate('Singapore'),
  hk: () => translate('Hong Kong'),
  in: () => translate('India'),
  // Middle East & Africa
  il: () => translate('Israel'),
  za: () => translate('South Africa'),
  ae: () => translate('United Arab Emirates'),
};

/**
 * eduPerson affiliation value labels
 */
const EDUPERSON_AFFILIATIONS: Record<string, () => string> = {
  faculty: () => translate('Faculty'),
  staff: () => translate('Staff'),
  student: () => translate('Student'),
  employee: () => translate('Employee'),
  alum: () => translate('Alumni'),
  member: () => translate('Member'),
  affiliate: () => translate('Affiliate'),
  'library-walk-in': () => translate('Library walk-in'),
};

/**
 * Extract country code from domain TLD
 */
function extractCountryFromDomain(domain: string): string | null {
  if (!domain) return null;

  const parts = domain.toLowerCase().split('.');
  const tld = parts[parts.length - 1];

  // Check if TLD is a known country code (2 letters)
  if (tld.length === 2 && COUNTRY_NAMES[tld]) {
    return tld;
  }

  // Generic TLDs - no country
  if (['com', 'org', 'net', 'edu', 'gov', 'mil', 'int'].includes(tld)) {
    return null;
  }

  // Return TLD as potential country code if 2 letters
  return tld.length === 2 ? tld : null;
}

/**
 * Get human-readable country name
 */
export function getCountryLabel(countryCode: string | null): string {
  if (!countryCode) return translate('Unknown');
  const labelFn = COUNTRY_NAMES[countryCode.toLowerCase()];
  return labelFn ? labelFn() : countryCode.toUpperCase();
}

/**
 * Get attribute type label
 */
function getAttributeLabel(attrType: string | null): string {
  if (!attrType) return translate('Unknown');
  const normalized = attrType.toLowerCase().replace(/[^a-z]/g, '');
  const labelFn = ATTRIBUTE_LABELS[normalized];
  return labelFn
    ? labelFn()
    : attrType
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, (s) => s.toUpperCase())
        .trim();
}

/**
 * Determine category from attribute type
 */
function categorizeAttribute(attrType: string | null): AffiliationCategory {
  if (!attrType) return 'other';

  const lower = attrType.toLowerCase();

  if (lower.includes('homeorganization') && !lower.includes('type')) {
    return 'home-organization';
  }
  if (lower.includes('homeorganizationtype')) {
    return 'organization-type';
  }
  if (
    lower.includes('personalunique') ||
    lower.includes('targetedid') ||
    lower.includes('principalname')
  ) {
    return 'personal-identifier';
  }
  if (lower.includes('userstatus')) {
    return 'user-status';
  }
  if (lower.includes('eduperson') || lower.includes('affiliation')) {
    return 'eduperson';
  }

  return 'other';
}

/**
 * Parse a MACE URN
 * Format: urn:mace:<authority>:<namespace>:<attribute>:<value>...
 */
function parseMaceUrn(urn: string): Partial<ParsedAffiliation> {
  const parts = urn.split(':');
  // urn:mace:authority:namespace:attribute:value...
  // [0] [1]  [2]       [3]       [4]       [5+]

  if (parts.length < 5) {
    return { namespace: 'mace' };
  }

  const authority = parts[2]; // e.g., terena.org, incommon.org
  // parts[3] is the namespace (e.g., schac, dir, eduorg) - not used separately
  const attribute = parts[4]; // e.g., homeOrganization

  // Remaining parts are the value
  const valueParts = parts.slice(5);

  const result: Partial<ParsedAffiliation> = {
    namespace: 'mace',
    authority,
    attributeType: attribute,
    attributeTypeLabel: getAttributeLabel(attribute),
  };

  // Parse based on attribute type
  const lowerAttr = attribute.toLowerCase();

  if (lowerAttr === 'homeorganization') {
    // Value is a domain
    const domain = valueParts[0];
    result.organization = domain;
    result.country = extractCountryFromDomain(domain);
    result.displayName = domain;
  } else if (
    lowerAttr === 'personaluniquecode' ||
    lowerAttr === 'personaluniqueid'
  ) {
    // Format: scope:type:domain:id or scope:type:id
    if (valueParts.length >= 3) {
      result.scope = valueParts[0];
      const codeType = valueParts[1];
      if (valueParts.length >= 4) {
        result.organization = valueParts[2];
        result.identifier = valueParts.slice(3).join(':');
        result.country =
          result.scope === 'int'
            ? extractCountryFromDomain(result.organization)
            : result.scope;
        result.displayName = `${result.organization} (${result.identifier})`;
      } else {
        result.identifier = valueParts[2];
        result.country = result.scope;
        result.displayName = `${codeType}: ${result.identifier}`;
      }
    }
  } else if (lowerAttr === 'homeorganizationtype') {
    // Format: scope:type
    if (valueParts.length >= 2) {
      result.scope = valueParts[0];
      result.country = result.scope;
      result.displayName = formatOrganizationType(
        valueParts.slice(1).join(':'),
      );
    }
  } else {
    // Generic: just join the remaining parts
    result.displayName = valueParts.join(':') || attribute;
  }

  return result;
}

/**
 * Parse a SCHAC URN (direct, not via MACE)
 * Format: urn:schac:<attribute>:<scope>:<type>:<value>...
 */
function parseSchacUrn(urn: string): Partial<ParsedAffiliation> {
  const parts = urn.split(':');
  // urn:schac:attribute:scope:type:value...
  // [0] [1]   [2]       [3]   [4]  [5+]

  if (parts.length < 3) {
    return { namespace: 'schac' };
  }

  const attribute = parts[2];
  const valueParts = parts.slice(3);

  const result: Partial<ParsedAffiliation> = {
    namespace: 'schac',
    attributeType: attribute,
    attributeTypeLabel: getAttributeLabel(attribute),
  };

  const lowerAttr = attribute.toLowerCase();

  if (lowerAttr === 'homeorganization') {
    const domain = valueParts[0];
    result.organization = domain;
    result.country = extractCountryFromDomain(domain);
    result.displayName = domain;
  } else if (
    lowerAttr === 'personaluniquecode' ||
    lowerAttr === 'personaluniqueid'
  ) {
    // Format: scope:type:domain:id
    if (valueParts.length >= 3) {
      result.scope = valueParts[0];
      const codeType = valueParts[1];
      if (valueParts.length >= 4) {
        result.organization = valueParts[2];
        result.identifier = valueParts.slice(3).join(':');
        result.country =
          result.scope === 'int'
            ? extractCountryFromDomain(result.organization)
            : result.scope;
        result.displayName = `${result.organization} (${result.identifier})`;
      } else {
        result.identifier = valueParts[2];
        result.country = result.scope;
        result.displayName = `${codeType}: ${result.identifier}`;
      }
    }
  } else if (lowerAttr === 'homeorganizationtype') {
    if (valueParts.length >= 2) {
      result.scope = valueParts[0];
      result.country = result.scope;
      result.displayName = formatOrganizationType(
        valueParts.slice(1).join(':'),
      );
    }
  } else if (lowerAttr === 'userstatus') {
    if (valueParts.length >= 2) {
      result.scope = valueParts[0];
      result.country = result.scope;
      result.displayName = valueParts.slice(1).join(':');
    }
  } else {
    result.displayName = valueParts.join(':') || attribute;
  }

  return result;
}

/**
 * Parse eduPerson simple affiliation values
 */
function parseEduPersonAffiliation(value: string): Partial<ParsedAffiliation> {
  const lower = value.toLowerCase().trim();
  const labelFn = EDUPERSON_AFFILIATIONS[lower];

  return {
    namespace: 'eduperson',
    attributeType: 'affiliation',
    attributeTypeLabel: translate('Affiliation'),
    displayName: labelFn
      ? labelFn()
      : value.charAt(0).toUpperCase() + value.slice(1),
  };
}

/**
 * Format organization type to human-readable label
 */
function formatOrganizationType(type: string): string {
  const typeLabels: Record<string, () => string> = {
    highereducationalinstitution: () =>
      translate('Higher Education Institution'),
    university: () => translate('University'),
    nren: () => translate('NREN'),
    researchinstitution: () => translate('Research Institution'),
    other: () => translate('Other'),
  };

  const normalized = type.toLowerCase().replace(/[^a-z]/g, '');
  const labelFn = typeLabels[normalized];
  return labelFn
    ? labelFn()
    : type
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, (s) => s.toUpperCase())
        .trim();
}

/**
 * Parse any affiliation value into structured data
 */
export function parseAffiliation(value: string | null): ParsedAffiliation {
  const result: ParsedAffiliation = {
    raw: value || '',
    namespace: null,
    authority: null,
    attributeType: null,
    attributeTypeLabel: translate('Unknown'),
    scope: null,
    country: null,
    countryLabel: translate('Unknown'),
    organization: null,
    identifier: null,
    displayName: value || translate('Unknown'),
    category: 'other',
    categoryLabel: CATEGORY_LABELS.other(),
  };

  if (!value || typeof value !== 'string') {
    return result;
  }

  const trimmed = value.trim();
  const lower = trimmed.toLowerCase();

  let parsed: Partial<ParsedAffiliation> = {};

  // Detect and parse URN format
  if (lower.startsWith('urn:mace:')) {
    parsed = parseMaceUrn(trimmed);
  } else if (lower.startsWith('urn:schac:')) {
    parsed = parseSchacUrn(trimmed);
  } else if (lower.startsWith('urn:oid:')) {
    // OID URN - just display as-is
    parsed = {
      namespace: 'oid',
      displayName: trimmed.substring(8), // Remove 'urn:oid:'
    };
  } else if (lower.startsWith('urn:')) {
    // Generic URN
    const parts = trimmed.split(':');
    parsed = {
      namespace: parts[1] || null,
      displayName: parts.slice(2).join(':'),
    };
  } else if (EDUPERSON_AFFILIATIONS[lower]) {
    // Simple eduPerson affiliation value (faculty, staff, student, etc.)
    parsed = parseEduPersonAffiliation(trimmed);
  } else if (trimmed.includes('@')) {
    // Scoped value (e.g., student@university.edu)
    const [affValue, scope] = trimmed.split('@');
    parsed = {
      ...parseEduPersonAffiliation(affValue),
      scope,
      organization: scope,
      country: extractCountryFromDomain(scope),
      displayName: `${EDUPERSON_AFFILIATIONS[affValue.toLowerCase()]?.() || affValue} @ ${scope}`,
    };
  } else {
    // Unknown format - try to extract domain if it looks like one
    if (trimmed.includes('.') && !trimmed.includes(' ')) {
      parsed = {
        organization: trimmed,
        country: extractCountryFromDomain(trimmed),
        displayName: trimmed,
      };
    }
  }

  // Merge parsed data
  Object.assign(result, parsed);

  // Set country label
  result.countryLabel = getCountryLabel(result.country);

  // Set category
  result.category = categorizeAttribute(result.attributeType);
  result.categoryLabel = CATEGORY_LABELS[result.category]();

  return result;
}

/**
 * Get unique countries from parsed affiliations
 */
export function getUniqueCountries(
  affiliations: ParsedAffiliation[],
): Array<{ code: string; label: string }> {
  const countries = new Map<string, string>();

  affiliations.forEach((aff) => {
    if (aff.country) {
      countries.set(aff.country, aff.countryLabel);
    }
  });

  return Array.from(countries.entries())
    .map(([code, label]) => ({ code, label }))
    .sort((a, b) => a.label.localeCompare(b.label));
}

/**
 * Get unique categories from parsed affiliations
 */
export function getUniqueCategories(
  affiliations: ParsedAffiliation[],
): Array<{ category: AffiliationCategory; label: string }> {
  const categories = new Map<AffiliationCategory, string>();

  affiliations.forEach((aff) => {
    categories.set(aff.category, aff.categoryLabel);
  });

  return Array.from(categories.entries())
    .map(([category, label]) => ({ category, label }))
    .sort((a, b) => a.label.localeCompare(b.label));
}

/**
 * Get unique organizations from parsed affiliations
 */
export function getUniqueOrganizations(
  affiliations: ParsedAffiliation[],
): string[] {
  const orgs = new Set<string>();

  affiliations.forEach((aff) => {
    if (aff.organization) {
      orgs.add(aff.organization);
    }
  });

  return Array.from(orgs).sort();
}
