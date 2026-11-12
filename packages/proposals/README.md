# waldur-proposals

Proposal workflow pieces shared by the portal (`src/`) and the micro-apps
(`apps/*`). It sits one level above `waldur-ui`: `waldur-ui` holds building
blocks that know nothing about Waldur, this package holds a slice of the
proposal domain built from them.

## What is here

| Module                                     | What it holds                                                                                                |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------------------ |
| `contributions/queries.ts`                 | Query hooks and keys for a proposal's contributions, their form answers, offering assessments and reopenings |
| `workflow/queries.ts`                      | Workflow state and step queries, `latestInstanceOfEachStep`                                                  |
| `outcomes.ts`                              | Wording of step and contribution outcomes and statuses                                                       |
| `CoiDeclaration`                           | The conflict-of-interest declaration a contributor confirms                                                  |
| `contributions/ContributionOutcomeBadge`   | An outcome as a badge                                                                                        |
| `contributions/SubmitContributionDialog`   | Submit a contribution with its outcome, conditions and comment                                               |
| `contributions/DelegateContributionDialog` | Hand a contribution on to one of its candidates                                                              |
| `contributions/useContributionActions`     | Accept, decline and take back a handed-on contribution                                                       |
| `contributions/ContributionCard`           | One contribution with the actions its holder may take                                                        |

## Rules

- **No router, no store, no `@/` imports.** What an app knows comes in as
  props: who is signed in (`currentUserUuid`), where its pages are
  (`formHref`). Links go through `waldur-ui`'s `AppLink`, drawn by the app's
  `LinkProvider`.
- **The backend decides what a viewer may do.** A contribution carries
  `can_fill`, `can_delegate` and `can_accept`; the components show the
  actions those allow and add no permission logic of their own.
- **The SDK is not a dependency here.** `waldur-js-client` resolves through
  workspace hoisting, as in `waldur-api-client`, so every app sees the one
  pinned (or locally linked) build.

## Moving code here

Follow the `waldur-form` extraction (#450): `git mv` the module into this
package, replace the old file in `src/` with a one-line re-export so the
portal's imports do not change, and swap the module's `@/` imports for
their package equivalents (`waldur-i18n-runtime`, `waldur-form`,
`waldur-shell`'s `useManagedMutation`, `waldur-notifications`).

Still in `src/` and next in line:

- `StepContributionsSection.tsx`: its card and delegation actions duplicate
  `ContributionCard` and `useContributionActions` here. Move it once the
  open MRs editing it (!8254, !8255) have merged, and drop the copies.
- `StepChecklistSection.tsx`, the step's form: needs file upload in
  `waldur-form` (homeport #482).
- The workflow timeline: needs `FormSteps`/`ProgressSteps` in `waldur-ui`.
- Resource requests and activity: need tables. The portal's is now the
  `waldur-table` package, so these can move (homeport #454).
