import enforceActionsDropdownInTables from './rules/enforce-actions-dropdown-in-tables.js';
import enforceBadgeDesignTokens from './rules/enforce-badge-design-tokens.js';
import enforceBadgeIconPatterns from './rules/enforce-badge-icon-patterns.js';
import enforceBadgePropsConsistency from './rules/enforce-badge-props-consistency.js';
import enforceBadgeRightIconPattern from './rules/enforce-badge-right-icon-pattern.js';
import enforceBorderRadiusTokens from './rules/enforce-border-radius-tokens.js';
import enforceBreadcrumbColors from './rules/enforce-breadcrumb-colors.js';
import enforceButtonVariants from './rules/enforce-button-variants.js';
import enforceDisabledButtonTooltip from './rules/enforce-disabled-button-tooltip.js';
import enforceFeaturedIcon from './rules/enforce-featured-icon.js';
import enforceFormcheckComponents from './rules/enforce-formcheck-components.js';
import enforceNavTabsPattern from './rules/enforce-nav-tabs-pattern.js';
import enforceNoResultWithCta from './rules/enforce-noresult-with-cta.js';
import enforcePhosphorIconWeight from './rules/enforce-phosphor-icon-weight.js';
import enforceRenderFieldOrDash from './rules/enforce-render-field-or-dash.js';
import noBootstrapButtonMarkup from './rules/no-bootstrap-button-markup.js';
import noDirectBootstrapButton from './rules/no-direct-bootstrap-button.js';
import noDirectBootstrapDropdownButton from './rules/no-direct-bootstrap-dropdown-button.js';
import noDirectClientUsage from './rules/no-direct-client-usage.js';
import noDirectFieldAdapter from './rules/no-direct-field-adapter.js';
import noEditButtonSizeOverride from './rules/no-edit-button-size-override.js';
import noHandRolledTable from './rules/no-hand-rolled-table.js';
import noManualIconColorsInBadges from './rules/no-manual-icon-colors-in-badges.js';
import noRedundantViMock from './rules/no-redundant-vi-mock.js';
import noTemplateInTranslate from './rules/no-template-in-translate.js';
import noUndefinedInMutationBody from './rules/no-undefined-in-mutation-body.js';
import preferAlertItem from './rules/prefer-alert-item.js';
import preferClassnamesUtility from './rules/prefer-classnames-utility.js';
import preferMutateOverMutateAsync from './rules/prefer-mutate-over-mutateAsync.js';

export default {
  rules: {
    'enforce-actions-dropdown-in-tables': enforceActionsDropdownInTables,
    'enforce-badge-icon-patterns': enforceBadgeIconPatterns,
    'enforce-badge-props-consistency': enforceBadgePropsConsistency,
    'enforce-badge-design-tokens': enforceBadgeDesignTokens,
    'no-manual-icon-colors-in-badges': noManualIconColorsInBadges,
    'enforce-badge-right-icon-pattern': enforceBadgeRightIconPattern,
    'enforce-button-variants': enforceButtonVariants,
    'no-direct-bootstrap-button': noDirectBootstrapButton,
    'no-bootstrap-button-markup': noBootstrapButtonMarkup,
    'no-hand-rolled-table': noHandRolledTable,
    'prefer-alert-item': preferAlertItem,
    'no-direct-bootstrap-dropdown-button': noDirectBootstrapDropdownButton,
    'no-direct-client-usage': noDirectClientUsage,
    'no-edit-button-size-override': noEditButtonSizeOverride,
    'enforce-formcheck-components': enforceFormcheckComponents,
    'enforce-phosphor-icon-weight': enforcePhosphorIconWeight,
    'prefer-classnames-utility': preferClassnamesUtility,
    'enforce-render-field-or-dash': enforceRenderFieldOrDash,
    'prefer-mutate-over-mutateAsync': preferMutateOverMutateAsync,
    'no-direct-field-adapter': noDirectFieldAdapter,
    'enforce-disabled-button-tooltip': enforceDisabledButtonTooltip,
    'no-template-in-translate': noTemplateInTranslate,
    'no-undefined-in-mutation-body': noUndefinedInMutationBody,

    // Design system rules
    'enforce-featured-icon': enforceFeaturedIcon,
    'enforce-nav-tabs-pattern': enforceNavTabsPattern,
    'enforce-border-radius-tokens': enforceBorderRadiusTokens,
    'enforce-breadcrumb-colors': enforceBreadcrumbColors,
    'enforce-noresult-with-cta': enforceNoResultWithCta,
    'no-redundant-vi-mock': noRedundantViMock,
  },
};
