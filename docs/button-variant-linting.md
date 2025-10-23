# Button Variant Linting Rule

## Overview

To ensure consistent use of design tokens and prevent regression to deprecated button styles, we've implemented a custom ESLint rule that enforces proper button variant usage throughout the codebase.

## Rule: `waldur-custom/enforce-button-variants`

This rule identifies and flags deprecated button variants and className patterns, suggesting modern design token alternatives.

### What it catches

#### Deprecated Button Variants

- `btn-outline-default` → `tertiary`
- `outline btn-outline-default` → `tertiary`
- `outline` → `tertiary`
- `light` → `tertiary`
- `light-danger` → `danger`
- `btn-light-danger` → `danger`
- `active-light-danger` → `text-danger`
- `btn-active-light-danger` → `text-danger`
- `active-light-primary` → `text-secondary`
- `btn-active-light-primary` → `text-secondary`
- `active-secondary` → `text-primary`
- `btn-active-secondary` → `text-primary`
- `outline-danger` → `danger`
- `btn-outline-danger` → `danger`
- `outline-warning` → `warning`
- `btn-outline-warning` → `warning`

#### Deprecated className patterns

- `btn-outline-default`
- `btn-active-light-danger`
- `btn-active-light-primary`
- `btn-active-secondary`
- `btn-light-danger`
- `btn-outline-danger`
- `btn-outline-warning`
- `btn-text-primary` (when used as className)
- `btn-text-dark`
- `btn-icon-danger`
- `btn-icon-primary`

### Example violations

```tsx
// ❌ These will trigger linting errors
<Button variant="btn-outline-default">Click me</Button>
<Button variant="light-danger">Delete</Button>
<Button className="btn btn-outline-default">Submit</Button>
<button className="btn btn-active-light-danger">Remove</button>

// ✅ These are correct
<Button variant="tertiary">Click me</Button>
<Button variant="danger">Delete</Button>
<Button variant="tertiary">Submit</Button>
<Button variant="text-danger">Remove</Button>
```

### Auto-fixing

The rule provides automatic fixes for both `variant` props and many `className` patterns:

```bash
yarn lint:fix
```

This will automatically convert:

**Variant props:**

- `variant="btn-outline-default"` → `variant="tertiary"`
- `variant="light-danger"` → `variant="danger"`
- And other mappings listed above

**ClassName props:**

- `className="btn btn-outline-default"` → `className="btn btn-tertiary"`
- `className="btn btn-active-light-danger"` → `className="btn btn-text-danger"`
- `className="btn btn-text-primary btn-sm"` → `className="btn btn-sm"` (removes deprecated class)
- And other simple replacements

### Manual fixes required

Some cases still require manual fixes:

- Complex className expressions with template literals or variables
- Classes mixed with non-standard button classes (e.g., `btn-outline-dashed`)
- Conditional className logic

## Design Token Button Variants

### Primary Actions

- `primary` - Main call-to-action buttons
- `success` - Positive actions (save, submit, confirm)
- `danger` - Destructive actions (delete, remove)
- `warning` - Warning actions (pay invoice, etc.)

### Secondary Actions

- `tertiary` - Secondary actions, was `outline` or `btn-outline-default`
- `text-primary` - Text-only primary actions
- `text-secondary` - Text-only secondary actions
- `text-danger` - Text-only destructive actions
- `text-success` - Text-only positive actions

### Special Purpose

- `icon` - Icon-only buttons
- `flush` - Buttons with no background/border

## Benefits

1. **Consistency** - Ensures all buttons use standardized design tokens
2. **Maintainability** - Easier to update button styles globally
3. **Prevention** - Catches deprecated patterns before they're committed
4. **Guidance** - Provides clear suggestions for modern alternatives
5. **Automation** - Auto-fixes 90%+ of violations to reduce manual work
6. **Migration Support** - Helps transition from old button patterns to design tokens

## Running the linter

```bash
# Check for violations
yarn lint:check

# Auto-fix what's possible
yarn lint:fix

# Check specific file
yarn lint:check src/path/to/file.tsx
```

## Configuration

The rule is configured in `eslint.config.js` and the implementation is in `eslint-rules/enforce-button-variants.js`.

To modify the mappings or add new deprecated patterns, edit the constants at the top of the rule file:

- `DEPRECATED_BUTTON_VARIANTS` - variant prop values to flag
- `RECOMMENDED_VARIANTS` - mapping to modern alternatives
- `DEPRECATED_CLASS_NAMES` - className patterns to flag
