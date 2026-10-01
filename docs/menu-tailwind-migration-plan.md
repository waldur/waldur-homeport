# Metronic `menu*` → Tailwind Migration Plan

Plan for retiring Metronic's `.menu` / `.menu-*` classes and their SCSS, following the same approach as the [legacy button CSS retirement](tailwind-shadcn-migration-notes.md#legacy-button-css-retirement). Background on cascade layers, `!important` collisions and the 13px root font size is in [tailwind-shadcn-migration-notes.md](tailwind-shadcn-migration-notes.md).

> [!NOTE]
> **Status**: proposal. Nothing below has been migrated yet. The sidebar already uses `waldur-ui` and carries no `menu-*` classes.

---

## Scope

The `menu*` classes appear in about 25 component files, backed by about 1,200 lines of SCSS. Every popup menu already goes through one shell, `src/navigation/NavMenu.tsx`, so most of the work is changing that shell's class strings and turning a few static link lists into plain markup.

### Call sites

| Group                                                | Files                                                                                                                                                                                                                                                                                                                           | Notes                                                                                                                                                                                                                |
| :--------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **A. Popup menus on `NavMenu`** (Radix DropdownMenu) | `navigation/NavMenu.tsx`, `header/UserDropdown`, `header/UserDropdownMenuItems`, `header/LanguageSelectorDropdown`, `header/UserToken`, `header/UserIpAddress`, `header/WebShellMenuItem`, `theme/ThemeSwitcher`, `navigation/TabsList` (tabs with children), `footer/FooterDropdown`, `marketplace/deploy/steps/BoxRadioField` | Wear `menu-sub-dropdown` and fake `.show` plus `data-popper-placement` so the old Metronic CSS still applies. Each call site repeats theme classes such as `menu-gray-600 menu-state-bg-gray menu-dropdown-default`. |
| **B. Popover menus on `PopoverMenuContent`**         | `table/TableFiltersMenu`, `table/TableFilterItem`, `table/TableBody`, `core/async/AsyncSearchBox`, `invitations/actions/create/RoleAndProjectSelectField`                                                                                                                                                                       | Same panel, but holding form fields. Extra rules live in `custom/_table.scss`: the `.table-filters-menu` row height and the column filter's `margin-left: -125px`.                                                   |
| **C. Static link lists** (not real menus)            | `navigation/Toolbar.tsx` (header tabs, `menu-row`), `navigation/TabsList` (simple tabs, `.here` marks the active one), footer `MenuItem`, `FooterLinks` (`menu-brand`), `SupportMenu`, `LegalPrivacyMenu`, `IssuesLink`, `header/DocsLink`, `auth/LoginColumn.scss`                                                             | Use the classes only for layout and colour.                                                                                                                                                                          |
| **D. One-offs**                                      | `marketplace/landing/MarketplaceLandingFilter` (a fixed `Card` wearing `menu-sub-dropdown show`), `core/async/AsyncSearchBox` (`menu menu-column`)                                                                                                                                                                              |                                                                                                                                                                                                                      |

### SCSS to delete at the end

- `src/metronic/sass/core/components/_menu.scss`
- `src/metronic/sass/core/components/menu/_base.scss` and `_theme.scss`
- `src/metronic/sass/core/components/mixins/_menu.scss`
- `src/metronic/sass/custom/_menu.scss` and `custom/brand/_menu.scss`
- the menu rules in `custom/_table.scss` and `src/auth/LoginColumn.scss`
- the `$menu` variable map in `core/components/_variables.scss` (nothing else reads `get($menu, …)`)

---

## Behaviour the Tailwind versions must reproduce

- **Row padding**: the base is `0.615rem 0.923rem`, about 8px × 12px at the app's 13px root. `menu-dropdown-default` overrides it to `10px 16px` with line-height 1.432. Use px arbitrary values; rem values are wrong at the 13px root.
- **Colour themes**: `menu-gray-600/700` set the text colour. `menu-state-bg-gray/light` set the hover background. `menu-state-title-primary` and `menu-hover-title-primary` turn the text brand colour on hover. The brand overrides use `$brand-700`.
- **States**: hover, Radix `[data-highlighted]`, `.active`, `.here`, `.disabled` (gray-400, `not-allowed`) and the focus ring. Hover must be skipped on active, here and disabled rows.
- **Panel**: dropdown shadow, `$border-radius`, body background, `z-index: 105`, and the fade plus 0.75rem slide-in, reversed when the menu opens upwards. The panel base class in `packages/ui/src/DropdownMenu.tsx` already ports this exactly.
- **`.menu-arrow`**: an SVG background chevron. In the header it is grey by default, brand-coloured on hover or when open, and rotates 270° when open. Replace it with a Phosphor `CaretRight` that rotates on `data-[state=open]`.
- **Bootstrap utilities on the same elements**: call sites mix in `p-*`, `border` and `bg-transparent`, whose `!important` beats same-named Tailwind classes. Write `p-[12px]` and `border-[1px]` instead.

---

## Plan

Each step can be shipped and visually checked on its own. Steps 1–2 fit in one merge request (about 12 files), as do 3 and 4–6.

### Step 0 — Baseline

Add visual specs for the user dropdown, the language submenu, the header tabs and their child menu, the footer, and the table filter menu. Set up the compiled-CSS diff used for the `.btn` deletion.

### Step 1 — One shared set of styles

Keep `NavMenu`'s API (`NavMenuItem`, `NavMenuContent`, `NavMenuSub*`, `PopoverMenuContent`, `useHoverMenu`) and change only what it renders.

- Reuse and export the panel base class from `waldur-ui`'s `DropdownMenu`.
- Add a row style for these menus: bold, 10px × 16px padding, gray-600 text, and the `data-highlighted` and active states.

> [!IMPORTANT]
> **Open decision**: keep the Metronic look for these menus, or take shadcn's default (`text-sm px-2 py-1.5`)? Keeping it means a `variant` on `DropdownMenu`; switching is a visible design change.

### Step 2 — Migrate the `NavMenu` shell (group A)

- Replace `NAV_MENU_CONTENT_CLASSNAME` and `NAV_MENU_SUB_CONTENT_CLASSNAME` with the Tailwind styles.
- Drop the faked `.show` and `data-popper-placement`, and the `menu-item` wrapper div.
- Remove the theme classes repeated at call sites; the shell becomes the default. This also removes the bug class where a call site forgot `menu-state-bg-*`.
- Replace `<span className="menu-title">` with plain flex spans.
- Delete the matching bridges in `custom/_menu.scss` (`[data-highlighted]`, the move animations).

### Step 3 — Popover menus (group B)

- Move the `custom/_table.scss` filter-menu rules into the components.
- Replace the column-filter offset hack with Radix `align` and `alignOffset`.
- Replace the `.role-project-select-popup` z-index fix with the tokens from `zIndex.css`.

### Step 4 — Static lists (group C)

Make these semantic `<nav><ul className="flex …">` with one Tailwind link style.

- The riskiest part is the header tabs: `.here` and active colours, the caret colours and rotation, the focus-ring overrides in `custom/_menu.scss`, and the breakpoint switch for `.header-menu` in `layout/_header.scss`.
- Add a test for each state.

### Step 5 — One-offs (group D)

- `BoxRadioField`'s version list could become a Radix RadioGroup or `DropdownMenuRadioGroup`.
- `MarketplaceLandingFilter` and `AsyncSearchBox` only need the panel styles.

### Step 6 — Delete the CSS and stop it coming back

- Remove the SCSS listed under [SCSS to delete at the end](#scss-to-delete-at-the-end) and verify with the compiled-CSS diff.
- Add an ESLint rule `no-metronic-menu-classes` to `packages/eslint-plugin-waldur`, modelled on `no-bootstrap-button-markup`, flagging `menu` / `menu-*` class tokens. Start at `warn`; promote to `error` when the count reaches zero.
- Update tests that look up these classes: `src/navigation/NavMenu.test.tsx` (`closest('.menu-sub-dropdown')`), `src/navigation/footer/FooterDropdown.test.tsx` (`toHaveClass('menu-item')`) and `e2e-visual/focus-ring.spec.ts` (`menu-link`).
- Update the "Dropdown & Menu System Map" and "NavMenu" sections of [tailwind-shadcn-migration-notes.md](tailwind-shadcn-migration-notes.md).
