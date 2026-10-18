/**
 * Locales generated from template.json rather than translated by hand.
 * en-GB is the British spelling of the US source (generateBritishEnglish.cjs)
 * and lists only the strings that differ, so it is never "incomplete" and
 * never edited: change the rules in britishSpelling.cjs instead.
 */
const GENERATED_LOCALES = ['en-GB'];

const isGeneratedLocale = (code) => GENERATED_LOCALES.includes(code);

/** Exits with a pointer to the generator when asked to hand-edit one. */
const refuseGeneratedLocale = (code) => {
  if (isGeneratedLocale(code)) {
    console.error(
      `locales/${code}.json is generated from template.json; do not edit it. Change locales/tools/britishSpelling.cjs and run \`yarn i18n:extract\`.`,
    );
    process.exit(1);
  }
};

module.exports = { isGeneratedLocale, refuseGeneratedLocale };
