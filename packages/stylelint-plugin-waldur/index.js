import stylelint from 'stylelint';

import fontSizeScale, {
  ruleName as fontSizeScaleRuleName,
} from './rules/font-size-scale.js';
import noLiteralColor, {
  ruleName as noLiteralColorRuleName,
} from './rules/no-literal-color.js';
import noRemLength, {
  ruleName as noRemLengthRuleName,
} from './rules/no-rem-length.js';

export default [
  stylelint.createPlugin(fontSizeScaleRuleName, fontSizeScale),
  stylelint.createPlugin(noLiteralColorRuleName, noLiteralColor),
  stylelint.createPlugin(noRemLengthRuleName, noRemLength),
];
