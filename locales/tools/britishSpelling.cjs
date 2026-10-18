/**
 * US → British spelling rules shared by generateBritishEnglish.cjs (which
 * writes locales/en-GB.json) and checkSpelling.cjs (which keeps British
 * spelling out of the source strings).
 *
 * Source strings are US English. en-GB.json only lists the strings whose
 * British spelling differs; anything missing falls back to the source.
 *
 * Each rule rewrites a word stem, so one rule covers every inflection
 * (organize, organized, organization, organizational, ...). Matching is
 * case-aware: "organize", "Organize" and "ORGANIZE" each keep their case.
 */

// [US stem, British stem]. A stem only matches at the start of a word.
const STEM_RULES = [
  // -ize → -ise, -yze → -yse. Listed per word: "size", "prize", "seize"
  // and technical verbs (serialize, tokenize, sanitize) must not change.
  ['authoriz', 'authoris'],
  ['categoriz', 'categoris'],
  ['centraliz', 'centralis'],
  ['characteriz', 'characteris'],
  ['customiz', 'customis'],
  ['emphasiz', 'emphasis'],
  ['finaliz', 'finalis'],
  ['initializ', 'initialis'],
  ['maximiz', 'maximis'],
  ['minimiz', 'minimis'],
  ['normaliz', 'normalis'],
  ['optimiz', 'optimis'],
  ['organiz', 'organis'],
  ['personaliz', 'personalis'],
  ['prioritiz', 'prioritis'],
  ['realiz', 'realis'],
  ['recogniz', 'recognis'],
  ['specializ', 'specialis'],
  ['standardiz', 'standardis'],
  ['summariz', 'summaris'],
  ['synchroniz', 'synchronis'],
  ['utiliz', 'utilis'],
  ['visualiz', 'visualis'],
  ['analyz', 'analys'],
  // -or → -our
  ['behavior', 'behaviour'],
  // Not inside names: Colorado.
  ['color(?!ado)', 'colour'],
  ['favor', 'favour'],
  ['neighbor', 'neighbour'],
  // -er → -re
  ['centered', 'centred'],
  ['centering', 'centring'],
  ['center', 'centre'],
  // doubled consonant before -ed / -ing
  ['canceled', 'cancelled'],
  ['canceling', 'cancelling'],
  ['labeled', 'labelled'],
  ['labeling', 'labelling'],
  ['modeled', 'modelled'],
  ['modeling', 'modelling'],
  ['traveled', 'travelled'],
  ['traveling', 'travelling'],
  // single l
  ['enrollment', 'enrolment'],
  ['fulfillment', 'fulfilment'],
  // other
  ['defense', 'defence'],
  ['gray', 'grey'],
];

// Whole words only: as stems these would also match words that keep their
// spelling (laboratory, honorary) or inflections that keep the double l
// (enrolled, enrolling).
const WORD_RULES = [
  ['catalog', 'catalogue'],
  ['catalogs', 'catalogues'],
  ['honor', 'honour'],
  ['honors', 'honours'],
  ['honored', 'honoured'],
  ['labor', 'labour'],
  // British English spells the noun "licence" and the verb "license". The
  // strings use the noun; a string using the verb goes in KEEP_STRINGS.
  ['license', 'licence'],
  ['licenses', 'licences'],
  ['enroll', 'enrol'],
  ['enrolls', 'enrols'],
  ['fulfill', 'fulfil'],
  ['fulfills', 'fulfils'],
];

/*
 * Deliberately not converted:
 * - program: British English keeps "program" for software.
 * - dialog: the name of the UI element in both variants.
 * - judgment, aging, meter, check: both spellings are in British use, or
 *   the British form has a different meaning.
 */

// Source strings no rule may change, for a word the rules get wrong in that
// string (the verb "to license", a product name spelled the US way).
const KEEP_STRINGS = new Set([]);

// Names spelled the same in every variant: products and protocol tokens.
const PROTECTED_TERMS = ['Data Center', 'Authorization: Bearer'];

/*
 * Parts of a string that are not prose and must not change: the terms
 * above, placeholders, code spans, URLs, and identifiers (snake_case,
 * camelCase, dotted names).
 */
const PROTECTED = new RegExp(
  [
    ...PROTECTED_TERMS.map((term) => `\\b${term}`),
    /\{[^}]*\}|`[^`]*`|https?:\/\/\S+/.source,
    /\b\w*_\w*\b|\b[a-z]+[A-Z]\w*\b|\b\w+\.\w+(?:\.\w+)*\b/.source,
  ].join('|'),
  'g',
);

const withCase = (source, replacement) => {
  if (source === source.toUpperCase()) return replacement.toUpperCase();
  if (source[0] === source[0].toUpperCase()) {
    return replacement[0].toUpperCase() + replacement.slice(1);
  }
  return replacement;
};

const buildRule = (us, british, wholeWord) => ({
  pattern: new RegExp(`\\b${us}${wholeWord ? '\\b' : ''}`, 'gi'),
  british,
});

const RULES = [
  ...STEM_RULES.map(([us, british]) => buildRule(us, british, false)),
  ...WORD_RULES.map(([us, british]) => buildRule(us, british, true)),
];

const convertProse = (text) => {
  let result = text;
  for (const { pattern, british } of RULES) {
    result = result.replace(pattern, (match) => withCase(match, british));
  }
  return result;
};

/** The British English spelling of a US English source string. */
const toBritish = (key) => {
  if (KEEP_STRINGS.has(key)) return key;
  let result = '';
  let last = 0;
  for (const match of key.matchAll(PROTECTED)) {
    result += convertProse(key.slice(last, match.index)) + match[0];
    last = match.index + match[0].length;
  }
  return result + convertProse(key.slice(last));
};

/*
 * British forms that must not appear in a source string. Derived from the
 * rules above, minus words that are the same in both variants.
 */
const ISE_SUFFIX = '(?:e|ed|es|ing|er|ers|able|ably|ation|ations|ational)\\b';
// "analyses" is also the US plural of "analysis", so it is not a British form.
const YSE_SUFFIX = '(?:e|ed|ing|er|ers|able)\\b';
const BRITISH_FORMS = new RegExp(
  `\\b(?:${[
    // An -ise stem alone would also match words spelled the same in both
    // variants (realistic, specialist, organism, analysis, emphasis).
    ...STEM_RULES.map(([us, british]) => {
      if (/yz$/.test(us)) return british + YSE_SUFFIX;
      if (/iz$/.test(us)) return british + ISE_SUFFIX;
      return british;
    }),
    ...WORD_RULES.map(([, british]) => `${british}\\b`),
  ].join('|')})`,
  'i',
);

/** The first British spelling in a string, or null. */
const findBritishForm = (text) => {
  const prose = text.replace(PROTECTED, ' ');
  const match = prose.match(BRITISH_FORMS);
  if (!match) return null;
  const end = prose.slice(match.index).search(/\W|$/);
  return prose.slice(match.index, match.index + end);
};

module.exports = { toBritish, findBritishForm };
