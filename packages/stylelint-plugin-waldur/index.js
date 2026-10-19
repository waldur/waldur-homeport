import stylelint from 'stylelint';

import noRetiredClassSelectors, {
  ruleName as noRetiredClassSelectorsRuleName,
} from './rules/no-retired-class-selectors.js';

export default [
  stylelint.createPlugin(
    noRetiredClassSelectorsRuleName,
    noRetiredClassSelectors,
  ),
];
