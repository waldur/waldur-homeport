# Terminology policy

We prefer British English over American English. For example, we use `cancelled` instead of `canceled`.

Should be applied for naming buttons, separate pages of the process and in list of actions.

**Add** / **Remove**

Should be used when an action of creating/adding or deleting/removing is
applied to:

* Organizations
* Projects
* Providers
* VMs
* Applications
* SLA
* SSH key
* Team members

**Import** / **Unlink**

Should be used when an action of importing or unlinking / deleting a record without
undeploying is applied to:

* VMs

Please use "synchronise" instead of "pull" in action title.

## Marketplace

The destination is called **Marketplace**. "Service catalogue", "catalogue" and
"store" are not synonyms for it in the UI.

A deployment may rename it through the `MARKETPLACE_LANDING_PAGE` setting, and
then the chosen name replaces "Marketplace" everywhere at once. So never write
the name as a literal: read it from `getMarketplaceTitle()`
(`src/marketplace/title.ts`). The sidebar entry, the breadcrumbs, the browser
title and the landing hero all derive from it — a deployment that sets "Service
Catalog" must not end up with a sidebar saying "Marketplace" next to a hero
saying "Welcome to Service Catalog".

What the marketplace lists are **offerings**; what a user has ordered are
**resources**. Search inputs are named after the scope they cover, so an
offering search never says just "Search".

## Units of measurement

Component units (`measured_unit`) are written in the **singular**. They appear
mainly in rate expressions — "Cost: EUR 4.50 per core", "EUR 0.02 per GB",
"EUR 1.20 per hour" — and in a "Unit" column, both of which read as singular.

* Write `core`, `hour`, `node hour`, `GPU hour`, `seat`.
* Not `cores`, `hours`, `node hours`, `units`.

Symbols and abbreviations keep their standard form and are never pluralised:
`GB`, `TB`, `vCPU`, `GB-hour`.

Where a display needs a plural ("120 hours used"), pluralise in the copy around
the value — never by storing a plural unit.
