# Class Names and Data Attributes

What goes on an element, and why: native HTML attributes and ARIA for what users perceive, classes for styling, and `data-*` attributes (`data-slot`, a state attribute such as `data-state` or `data-variant`, or `data-testid`) for everything else.

## Short version

- **State users should perceive is a native attribute or ARIA.** Use `disabled`, `checked`, `open`, `aria-expanded`, `aria-current`, `aria-invalid` and so on, and style from that attribute (`disabled:`, `aria-expanded:`). A `data-*` attribute never stands in for it.
- **A class styles something.** Tailwind utilities, a class a stylesheet defines, or a third-party library's class. Nothing else.
- **A `data-*` attribute marks what has no meaning for assistive technology.** It names a component's part (`data-slot`), carries a visual state or variant (`data-state`, `data-variant`, `data-error`), or gives a test something to find (`data-testid`).
- **A test or a script finds an element by its role and name first**, by a `data-*` attribute when it has none, and never by a class.

## Why

Tailwind and Bootstrap ignore a class they do not know, so a class that styles nothing renders as nothing. No build, type check or browser warns about it. Such a class is either a typo or a hook, and nothing on the page tells you which one:

- **Hooks hidden in class names break silently.** An unstyled class looks dead, so a styling change removes it. If the waldur-integration-testing suite selected it, that suite fails while nothing in HomePort does, because the reader lives in another repository.
- **A class can be styled from elsewhere.** A parent's arbitrary variant (`[&_.x]:text-warning`) styles a class that no stylesheet names. The class looks unused in its own file, and removing it silently drops the styling.
- **Lint enforces it.** `waldur-custom/no-unknown-class` fails on any class that styles nothing (see "Unknown class guard" in [code-quality.md](code-quality.md)). A marker class has to be either an attribute or an explicit, commented exception.

An attribute says what it is for in its own name. A styling refactor leaves it alone. It can carry a value (`data-variant="success"`), Tailwind styles it directly (`data-[state=open]:`), and Radix and waldur-ui already render it.

## Decision table

| You need to…                                            | Use                                                       | Example                                                                                |
| :------------------------------------------------------ | :-------------------------------------------------------- | :------------------------------------------------------------------------------------- |
| Style an element                                        | Tailwind utilities in `className`                         | `className="flex items-center gap-2 text-secondary"`                                   |
| Expose state users should perceive                      | a native attribute, or ARIA when there is none            | `disabled`, `checked`, `aria-expanded={open}`, `aria-current="page"`, `aria-invalid`   |
| Style by that state                                     | Tailwind's native-state and `aria-*` variants             | `disabled:opacity-50`, `aria-expanded:bg-tertiary`, `aria-[current=page]:text-brand`   |
| Use styles a stylesheet already defines                 | that class                                                | `className="card-bordered"`, `className="team-chat"`, `className="form-table"`         |
| Let a caller style a component                          | a `className` prop, merged with `cn()`                    | `<Tag className="me-1">`                                                               |
| Name a part of a component, for its parents or tests    | `data-slot`                                               | `data-slot="modal-body"`, `data-slot="menu-item-icon"`, `data-slot="filter-field"`     |
| Expose a state or variant with no accessibility meaning | `data-state`, `data-variant`, `data-size`, a boolean flag | `data-state="open"`, `data-variant={variant}`, `data-error={invalid ? '' : undefined}` |
| Style by that state                                     | Tailwind `data-[…]:` variants                             | `data-[state=open]:animate-…`, `group-data-[state=open]:rotate-180`                    |
| Style a child by its part or state, from the parent     | `[&_[data-…]]:` on the parent                             | `[&_[data-error]]:text-warning`, `[&_[data-slot=filter-field]]:pt-0`                   |
| Find an element from app code (`querySelector`, `:has`) | `data-slot` (or an `id`)                                  | `[data-slot="table-filters-menu"] #filter-item-…`                                      |
| Find an element in a test                               | its role and accessible name                              | `getByRole('button', { name: 'Set filters' })`, `get_by_role("dialog", name=…)`        |
| … when it has no role or name that identifies it        | `data-testid`                                             | `data-testid="page-toolbar"`, `data-testid="team-chat-conversation"`                   |
| Find a third-party widget's parts (react-select)        | the library's own classes, allow-listed                   | `.metronic-select__menu` (`UNKNOWN_CLASS_HOOKS` in `eslint.config.js`)                 |

## Native state and ARIA first

Before reaching for any attribute, ask whether a screen-reader user should know the fact it expresses. If so, it belongs in HTML or ARIA. In order of preference:

1. **Semantic HTML and native attributes:** `<button>`, `<nav>`, `<dialog>`, `disabled`, `checked`, `open`, `required`, `hidden`. The browser, assistive technology and CSS all understand them as they are.
2. **ARIA, where HTML has no equivalent:** `role`, `aria-label`, `aria-expanded`, `aria-selected`, `aria-current`, `aria-pressed`, `aria-invalid`, `aria-describedby`.
3. **`data-*`, for what has no meaning for assistive technology:** a component's parts, visual variants, hooks for app code, test ids.

**Style from the attribute that carries the meaning**, so what users see and what assistive technology announces cannot drift apart. Tailwind has a variant for each: `disabled:`, `checked:`, `open:`, `required:`, `invalid:` (native validity), `aria-expanded:`, `aria-selected:`, `aria-disabled:`, `aria-invalid:`, `aria-[current=page]:`, and `group-aria-expanded:` / `peer-disabled:` for neighbours. A named `aria-*:` variant matches only the value `"true"` (`aria-invalid:` is `[aria-invalid="true"]`), so render `true`, not `"yes"`; for other values use the bracket form, as in `aria-[current=page]:`.

```tsx
// Input: one attribute is both the announced state and the styling hook.
<input
  aria-invalid={invalid ? true : undefined}
  className="border-primary aria-invalid:border-[var(--input-invalid-border)]"
/>

// Pagination: the current page is announced and highlighted by the same attribute.
<a
  aria-current={item.isActive ? 'page' : undefined}
  className="aria-[current=page]:text-[var(--pagination-text-current)]"
/>

// Calendar's month picker: the open state comes from aria-expanded.
<button aria-expanded={open} className="hover:bg-tertiary aria-expanded:bg-tertiary" />
```

Rules:

- **Never add ARIA just to get a hook.** ARIA changes what assistive technology announces. A role or state that is not true misleads users, and no ARIA is better than wrong ARIA. For a styling or test hook, use `data-*`.
- **Do not mirror ARIA in `data-*`.** Style and test against `aria-expanded`, not a `data-expanded` you keep in sync with it. Radix is the one exception: it sets `data-state="open"` alongside `aria-expanded`, and `data-[state=…]:` is fine for its components, especially for states ARIA cannot express, such as a closing animation.
- **Tests check the ARIA attribute**, not its `data-*` twin: `expect(trigger).toHaveAttribute('aria-expanded', 'true')`.
- **A visual marker still needs an accessible counterpart.** `FormSteps`' `data-error` only colours a step's title; `aria-invalid` would be wrong on a navigation link. The error must also reach assistive technology some other way, such as an icon with an accessible name, or text linked with `aria-describedby`.

## Class names

Use a class only when something styles it:

- **Tailwind utilities.** Use them for most styling. See [design-tokens.md](design-tokens.md) for colours and font weights.
- **Stylesheet classes.** A class a `.scss` or `.css` file defines, such as `.team-chat`, `.form-table` or `.card-bordered`. One also counts when it only applies inside a parent (`.card .small`), or when a parent's arbitrary variant styles it (`[&_.x]:`).
- **Third-party classes.** Classes defined by a library stylesheet the app imports, such as Leaflet's `leaflet-*` (`import 'leaflet/dist/leaflet.css'`).
- **A `className` prop.** It lets the caller add its own utilities. Merge it with `cn()`, last, so it can override.

Do not:

- invent a class as a marker (`is-active`, `has-error`, `my-thing-wrapper`). Use an attribute.
- keep a class "in case something uses it". Find out ([Before you remove or rename](#before-you-remove-or-rename)), then keep it as an attribute or delete it.
- select by a class in tests or app code. A class can be renamed in a styling change that never looks at tests.

```tsx
// Wrong: `bookings-panel` styles nothing; it is a marker in disguise.
<Card className="card-bordered bookings-panel">

// Right: only the styling class. If something needs to find the card,
// give it a role and name, or a data attribute.
<Card className="card-bordered">
```

## `data-slot`: a component's parts

`data-slot` names a part of a component, so that parents, stylesheets, app code and tests can reach that part without knowing its markup. waldur-ui components set it on their parts: the modal parts (`modal-dialog`, `modal-body`, `modal-footer`; see [modals.md](modals.md)), `menu-item-icon` / `-label` / `-trailing`, `featured-icon`, `tag`, `toast` and `date-picker-input`.

Guidelines:

- **The component sets it, not its callers.** It is part of the component's API: renaming it is a breaking change for anything that selects it.
- **Name it in kebab-case after the component.** For example `menu-item-label`, not `label`, so slots from nested components never collide.
- **Use one slot per element.** For a variant or a state, add a separate attribute (`data-size`, `data-variant`) rather than a second slot.
- **Hand-written copies carry the slot too.** `InvoicePayButton` and `DropdownLink` write out `MenuItem`'s icon and label spans, because `Menu.Item` renders no slots under `asChild`. They set the same `data-slot`s.

Styling and finding a slot:

```tsx
// A parent styles a child part (Tailwind arbitrary variant).
<div className="p-6 [&_[data-slot=filter-field]]:pt-0">…</div>
```

```scss
// A stylesheet scopes into a dialog by its own class and a slot.
[data-slot='modal-dialog'].role-dialog {
  [data-slot='modal-body'] {
    padding: 0;
  }
}
```

```ts
// App code finds a part (TableBody's inline-filter check).
document.querySelector(
  '#kt_content_container [data-slot="table-filters-menu"] #filter-item-' + key,
);
```

## State and variant attributes

For state that assistive technology should know, use the native attribute or ARIA ([above](#native-state-and-aria-first)). Any other state or variant a component exposes is a `data-*` attribute, not a class it toggles. Radix sets several on its own (`data-state="open"`, `data-side`, `data-disabled`, `data-swipe`), and waldur-ui follows the same pattern (`data-variant`, `data-tone`, `data-size`).

- **Values are lowercase words:** `data-state="open"`, `data-variant="success"`.
- **A boolean flag is present or absent.** Render `''` for true and `undefined` for false (`data-error={invalid ? '' : undefined}`), never `"false"`: `[data-error]` matches any value, including `"false"`.
- **Style it with Tailwind's data variants.** On the element itself: `data-[state=open]:…`, `data-[selected]:…`. From an ancestor marked `group`: `group-data-[state=open]:…`. From the parent onto a child: `[&_[data-error]]:…`.

```tsx
// FormSteps: a step title marks itself while its section is invalid…
const title = (
  <div data-error={hasErrors ? '' : undefined} className="flex items-center">
    {step.label}
  </div>
);

// …and ScrollSpyNav's inactive link colours whatever is marked.
const SCROLLSPY_NAV_LINK_INACTIVE =
  'text-quaternary hover:text-brand [&_[data-error]]:text-warning';
```

```tsx
// Toast: a part, its variant, and the state Radix sets, all as attributes.
<RadixToast.Root
  data-slot="toast"
  data-variant={variant}
  className="data-[state=open]:animate-[waldur-toast-enter_.2s_ease-out]"
/>
```

## `data-testid`: for tests only

First find an element the way a user would: by its role and accessible name (`getByRole`, `getByLabelText`; see [testing.md](testing.md)). An icon-only button already has a name, because `BaseButton` uses its tooltip as the `aria-label`. Add a `data-testid` only when the element has no role or name that identifies it, such as a layout region, a container, or one of several similar elements.

- **Name what it is, not how it looks:** `page-toolbar`, `app-footer`, `provider-offering`, `team-chat-conversation`, `badge-right-icon`.
- **Never style by a test id.** If a stylesheet or app code needs the element, give it a `data-slot`.
- **Hooks the E2E suite uses are a contract with another repository.** List each one in [e2e-locators.md](e2e-locators.md) and leave a comment where it is rendered:

  ```tsx
  <div
    // The waldur-integration-testing suite selects the page tabs by this
    // (docs/e2e-locators.md).
    data-testid="page-toolbar"
    className="flex items-center h-[55px] …"
  >
  ```

- **Unit tests may use slots and state attributes for structure** (`[data-slot="modal-body"]`, `toHaveAttribute('data-error')`). That is how `Toast.test.tsx` checks the E2E hook, and how `FormSteps.test.tsx` checks the error marker.

## Before you remove or rename

A class or attribute can have readers that no unit test covers. Before removing or renaming one, look for each kind:

- **Stylesheets:** `.name` in `.scss`/`.css`, including nested BEM (`&--modifier`, `&__part`).
- **Arbitrary variants:** `[&_.name]`, `has-[.name]`, `group-[.name]` and `[&_[data-slot=name]]` in class strings.
- **App code:** `querySelector`, `closest`, `matches`, `classList`, `:has(…)`.
- **Tests and stories:** `toHaveClass`, `querySelector`, `getByTestId`, play functions; `e2e/` and `e2e-visual/`.
- **The integration suite:** waldur-integration-testing's `tests/**/*.py`, especially `tests/components/homeport_hooks.py`.
- **Git history:** `git log -G'\.name\b' -- '*.scss' '*.css'` shows whether the name was ever styled.

A hook another repository reads moves in three steps, because each repository's CI runs against the other's current `main`/`develop`:

1. HomePort renders the new hook beside the old one.
2. The other repository selects the new hook, keeping the old one as a fallback (`:is([data-testid="x"], .x)`).
3. HomePort drops the old hook. The other repository drops its fallback once the HomePort image it runs against includes step 3.

## Exceptions

Some classes have to stay as hooks even though they style nothing, for example react-select's `metronic-select__*`, which the library generates and the E2E suite reads. List such a class as a pattern in `UNKNOWN_CLASS_HOOKS` in `eslint.config.js`, with a comment saying who reads it. Keep that list short: every entry is a contract with no type check behind it.

## Checklist

- [ ] Every class I added styles something: a Tailwind utility, a stylesheet class, or a third-party class.
- [ ] State users should perceive is a native attribute or ARIA, and is styled from that attribute (`disabled:`, `aria-*:`).
- [ ] I added no ARIA that is not true, and no `data-*` attribute that mirrors one.
- [ ] Every marker I added is a `data-*` attribute: `data-slot` for parts, `data-state`/`data-variant`/a boolean flag for state, `data-testid` only for tests.
- [ ] Tests find elements by role and name first.
- [ ] Nothing selects or styles by `data-testid` except tests.
- [ ] Any hook the integration suite reads is listed in [e2e-locators.md](e2e-locators.md) and commented where it is rendered.
- [ ] Before removing a class or attribute, I checked the readers listed above, the integration suite included.
