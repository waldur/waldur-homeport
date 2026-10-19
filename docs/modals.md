# Modals

Every dialog is waldur-ui's Modal (`packages/ui/src/Dialog/Modal.tsx`), a Radix Dialog drawn in the app's modal geometry. There is no Bootstrap modal any more: react-bootstrap's `Modal`, `CloseButton` and `ModalContext`, and the `.modal*` / `.btn-close` classes, are gone, and the `no-bootstrap-modal` lint rule keeps them out.

The same component serves micro-apps: it has no app dependencies, and every length is in px, so it is the same size under the app's 13px root and a micro-app's 16px one.

## Where the pieces live

Everything a dialog needs is shared, so a micro-app gets the same `openDialog`, `confirm()`, dirty-form guard and mutation hooks as the app:

| Piece                                                                                                                                                                                                                       | Package                           |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------- |
| `ModalShell`, `ModalDialog`, the parts (`ModalHeader` … `ModalCloseButton`)                                                                                                                                                 | `waldur-ui`                       |
| `ModalProvider`, `useModal`, `ModalService`, `ModalRoot`, `ConfirmModalRoot`, `ConfirmationDialog`, `DeleteConfirmationDialog`, `CloseDialogButton`, `DirtyFormContext`, the types (`AppModalProps`, `ConfirmationOptions`) | `waldur-ui`                       |
| `useManagedMutation`, `useBatchMutation`                                                                                                                                                                                    | `waldur-shell` (uses react-query) |
| `showErrorResponse`, `setErrorResponseFormatter`                                                                                                                                                                            | `waldur-notifications`            |

In the app, `src/modal/*` re-export these, so `@/modal/actions`, `@/modal/ModalDialog`, `@/modal/useManagedMutation` and the rest keep working. The app adds only what is its own: `ModalRoot`/`ConfirmModalRoot` pass a Sentry error boundary (`ModalErrorBoundary`), `@/core/DirtyFormContext` keeps the react-final-form `DirtyStateReporter`, and `@/store/notify` registers the app's API error formatter, which the mutation hooks' error toasts then use.

A micro-app gets the host from `AppShell`, which mounts `ModalProvider`, `ModalRoot` and `ConfirmModalRoot` (with the shell's error boundary) around the page. The mutation hooks need a `QueryClientProvider` above them, which the micro-app provides.

### Extra fields in a confirmation

`confirm()` takes a text input (`showInput`, resolved as `result.input`) or any extra control through `extraField`: a `render(value, onChange)`, the `resultKey` it resolves under and an optional `toResult`. The app's OpenStack router picker is one:

```tsx
confirm(title, body, { extraField: routerConfirmField(tenant.uuid) });
// resolves with { router: <router url> } when a router is picked
```

## Which piece to use

| Need                                                            | Use                                                                                                           |
| --------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| Open a dialog from anywhere in the app                          | `openDialog(MyDialog, { size, resolve })` (`useModal()`) or `ModalService.open`                               |
| Ask yes/no                                                      | `confirm(title, body, options)` (`useModal()`), or `waitForConfirmation`                                      |
| The dialog's own layout                                         | `ModalDialog` (`@/modal/ModalDialog`): `title`, `subtitle`, `iconNode`, `footer`, `actions`                   |
| A dialog rendered in place (no `openDialog`), or in a micro-app | `<ModalShell open onHide size>` around a `ModalDialog`                                                        |
| A layout `ModalDialog` doesn't cover                            | `ModalHeader`, `ModalTitle`, `ModalSubtitle`, `ModalBody`, `ModalFooter`, `ModalCloseButton` from `waldur-ui` |
| Close the dialog from inside it                                 | `CloseDialogButton`, or `useModalHide()` from `waldur-ui`                                                     |

`ModalRoot` (the `openDialog` host) asks before closing a dialog whose form has unsaved input; `ConfirmModalRoot` opens confirmations on the `confirm` layer above it.

```tsx
const EditNameDialog = ({ resolve }) => (
  <Form onSubmit={resolve.onSubmit}>
    {({ handleSubmit, submitting }) => (
      // The form wraps the whole ModalDialog, so a submit button in `footer`
      // is inside it.
      <form onSubmit={handleSubmit}>
        <ModalDialog
          title={translate('Edit name')}
          footer={
            <>
              <CloseDialogButton />
              <SubmitButton submitting={submitting} label={translate('Save')} />
            </>
          }
        >
          <StringGroup name="name" label={translate('Name')} spaceless />
        </ModalDialog>
      </form>
    )}
  </Form>
);

openDialog(EditNameDialog, { size: 'md', resolve: { onSubmit } });
```

## Shell options

Passed to `openDialog` (or as `ModalShell` props):

| Option               | Default | Effect                                                                                                   |
| -------------------- | ------- | -------------------------------------------------------------------------------------------------------- |
| `size`               | 544px   | `sm` 400px, `md` 544px, `lg` 840px from 992px, `xl` 1140px from 1200px                                   |
| `centered`           | `true`  | Centre the box vertically                                                                                |
| `scrollable`         | `true`  | Keep header and footer in view and scroll the body; `false` scrolls the whole overlay instead            |
| `backdrop`           | `true`  | `'static'`: a click outside doesn't close it; `false`: no backdrop                                       |
| `keyboard`           | `true`  | Escape closes it                                                                                         |
| `animation`          | `true`  | The fade and slide                                                                                       |
| `title`              | —       | The accessible name when the visible title isn't a string (a string `ModalDialog` title names it itself) |
| `dialogClassName`    | —       | Classes on the outer box, which sizes and places it (`sm:max-w-[650px]` for a custom width)              |
| `className`          | —       | Classes on the scrolling overlay, a hook for a stylesheet                                                |
| `layer` (shell only) | `modal` | `confirm` stacks it above another open modal                                                             |

For a width between the sizes, pass `dialogClassName: 'sm:max-w-[650px]'`: the `sm:` prefix replaces the default width rather than sitting under it.

## Styling a part

Each part carries a `data-slot`: `modal-backdrop`, `modal` (the scrolling overlay), `modal-dialog` (the outer box), `modal-content` (the visible box), `modal-header`, `modal-title`, `modal-subtitle`, `modal-close`, `modal-body` and `modal-footer`. A stylesheet that needs to reach into a dialog scopes by its own hook class and the slot:

```scss
// RoleFormDialog.scss
[data-slot='modal-dialog'].role-dialog {
  max-width: 932px;
}
```

Component stylesheets imported from TSX are unlayered, so they beat Tailwind utilities; Metronic SCSS is in the `bootstrap` layer and does not.

Prefer props first: `bodyClassName="p-0"`, `headerClassName`, `footerClassName`. They go through `cn()`, so a padding class replaces the part's own instead of fighting it.

## Geometry

The values are the old Bootstrap modal's as Metronic and the app restyled it: 12px radius, `--bg-primary`, a two-step shadow (`--modal-shadow-xs` / `--modal-shadow`), 24px padding (12px above the body under a header, 8px above the footer), an 18px/28px medium title, a 14px `text-quaternary` subtitle, and a 13px close glyph at half opacity. The backdrop is `--modal-backdrop-bg` with a 3px blur; the layers are `--z-index-modal-backdrop`/`--z-index-modal` (1050/1055) and `--z-index-confirm-backdrop`/`--z-index-confirm` (1060/1065), below popovers, menus and date pickers so those open over a dialog.

## Tests

Find a dialog by its role and name, not by class: `screen.getByRole('dialog', { name: … })`, `getByRole('button', { name: 'Close' })`. For structure, use the slots (`[data-slot="modal-body"]`) or `getByTestId('modal-footer')`. The waldur-integration-testing suite finds dialogs the same way (see [e2e-locators.md](e2e-locators.md)).
