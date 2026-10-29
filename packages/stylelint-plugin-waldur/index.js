import stylelint from 'stylelint';

import noLiteralColor, {
  ruleName as noLiteralColorRuleName,
} from './rules/no-literal-color.js';
import noRetiredClassSelectors, {
  ruleName as noRetiredClassSelectorsRuleName,
} from './rules/no-retired-class-selectors.js';

export default [
  stylelint.createPlugin(noLiteralColorRuleName, noLiteralColor),
  stylelint.createPlugin(
    noRetiredClassSelectorsRuleName,
    noRetiredClassSelectors,
  ),
];
