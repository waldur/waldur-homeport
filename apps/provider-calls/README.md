# waldur-provider-calls (proof of concept)

A service provider's work in calls for proposals, as a standalone micro-app
on `waldur-shell`: the calls asking for the provider's offerings, the
assessments the calls hand to its offering teams, what applicants request,
and the demand per call and round.

It is built around the **offering manager**. The provider's owners get the
same app: they answer requests and see the team's slots, but have no
assessments of their own unless an offering has no manager and they stand
in. Offering evaluators, who hold no organisation role, see their tasks on
the Inbox and Team work pages.

`waldur.deploy` is `false`: CI and MR previews build it, production images
leave it out.

## Pages

| Page      | What it shows                                                                                                                 | Endpoints                                                                                                              |
| --------- | ----------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| Inbox     | Task counts, the user's tasks, calls waiting for an answer, team slots soonest due                                            | `proposal-my-tasks/` (+ `summary/`), `proposal-requested-offerings/?state=requested`, `…/team_slots/`                  |
| Requests  | Every call that asked for an offering; accept, or decline with a reason                                                       | `proposal-requested-offerings/` (+ `accept/`, `cancel/`)                                                               |
| Team work | Every open slot of the provider's offerings, and the user's own tasks                                                         | `…/team_slots/`, `proposal-my-tasks/`                                                                                  |
| Proposals | What applicants request of the provider's offerings                                                                           | `proposal-requested-resources/`                                                                                        |
| Awards    | Orders awards placed on the provider's offerings: awarded vs requested amounts; approve to provision, or refuse with a reason | `marketplace-orders/?provider_uuid=&state=` (kept where `award` is set), `approve_by_provider/`, `reject_by_provider/` |
| Demand    | Proposals and requested/awarded amounts per offering, call and round                                                          | `proposal-offering-demand/`                                                                                            |

A proposal opens here too (`proposals/<uuid>/`), as the offering team sees
it: the team's contributions with what each asks of its offering, submitted,
handed on, accepted or declined in place; the details; the steps. The cards
and dialogs come from `waldur-proposals` (`packages/proposals`), which the
portal uses as well. The step's form, the rest of the proposal and the
award's orders stay on the portal's pages, linked.

The provider switcher lists the organisations the user holds an offering
role in, plus owned organisations a call has asked for an offering of.
Requests and slots carry no provider of their own, so one provider is
always selected (the first, until the user picks), and it is kept in the
URL as `?provider=`.

## Run it

Under the portal's dev server, so it shares the portal's login (same origin,
same `waldur/auth/*` storage keys):

```bash
yarn workspace waldur-provider-calls dev:subpath   # this app on :5181, base /provider-calls/
yarn start                                         # the portal, which proxies /provider-calls to it
```

Then open `http://localhost:8001/provider-calls/` after logging in to the
portal. The `call_management` demo preset has providers to try:
`centre_north_admin` and `centre_south_admin` (owner and offering manager)
and `centre_south_evaluator` (offering evaluator), password `demo`.

Standalone (`yarn workspace waldur-provider-calls dev`, `:5181`) is a
different origin and so has no login of its own; it is only useful for
layout work. Set `VITE_ROOT_APP_URL` in `.env` (see `.env.example`) so its
links to the portal resolve.

## After the award

A provider has two checkpoints after a proposal is awarded:

- **The award's orders.** Allocation places an ordinary marketplace order on
  each awarded offering, consumer side already approved. The provider
  approves it (the resource is provisioned) or refuses it (nothing is, and
  that offering drops out of the award's extensions and final report). This
  is the Awards page.
- **Extension and closing steps.** A call can add an extension phase
  (applicant request, then e.g. a per-offering feasibility assessment by the
  offering team, then a decision) and a closing phase (final report). Their
  offering-team steps go to the managers of the offerings the award
  _provisioned_, not the ones requested. Their slots and tasks already appear
  on the Inbox and Team work pages, but are not marked as post-award:
  `OfferingTeamSlot` and `MyTask` carry no phase.

## Known gaps

- **No router dependency.** `src/router.ts` is a small History API router
  for five flat pages. Swap it for react-router once pages nest or load data
  per route.
- **Tables are `waldur-ui` `DataTable` without sorting, filtering or a
  pager.** The portal's `@/table` (fetchers, facets, row-action menus) is not
  in `packages/*` yet. Lists are fetched whole, except Proposals, which shows
  the newest 200.
- **A step's form is filled in the portal.** The card links there while
  required answers are missing; the form moves to `waldur-proposals` once
  `waldur-form` has file upload (see that package's README).
