# AI inference

A micro-app for people whose projects have inference services (an
OpenAI-compatible gateway such as CBorg, ALCF or LivChat): the models they
can call, their API keys and what those keys spend. They never see
offerings, plans or orders. Built on `waldur-shell` like
`apps/provider-calls`; `waldur.deploy` is `false`, so production images
leave it out.

Design canvas: <https://claude.ai/artifact/YQgLjByXpXYEVV5ffKsxoG>

## What the app calls what

| In the app      | In Waldur                                                                                                                                 |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| Service         | A marketplace resource of a site-agent offering with `enable_api_key_provisioning` or `expose_inference_playground` in its plugin options |
| Endpoint        | The resource's access endpoint ending in `/v1`, else the offering's                                                                       |
| Models          | The names in the offering's `models` option, narrowed by the resource's own selection (`options.models`)                                  |
| Key             | A `ResourceApiKey`; its `effective_models`, `spending_limit_status`, `estimated_cost`                                                     |
| A key's "owner" | Its assignee (`user`); a key with none is shared                                                                                          |

## Pages

- **Overview**: the user's spend this month and keys, then one card per
  service with its endpoint, model count and the user's key against its
  tightest limit. A requested service shows where it stands (waiting for
  approval, for the provider, being set up) until it is active.
- **Models**: per service, every model and which of the user's keys may call
  it.
- **API keys**: the user's keys, or everyone's in the project: models, every
  spending limit as a bar, state and why a key is paused. Managers issue a
  key (service, purpose, assignee or shared, models, limits per period);
  its assignee reveals and replaces it.
- **Usage & limits**: this month by key (tokens, estimated cost) and the
  limits that apply with their reset times.
- **Add a service** (`add/`): the inference offerings, then the project's
  spending limits for the chosen one and a name for invoices. An ordinary
  order on the offering's plan.

Who may do what is read from the roles' permissions:
`RESOURCE.MANAGE_CONSUMER_API_KEY` issues keys,
`RESOURCE.REVEAL_API_KEY` reveals shared ones, an assigned key is revealed
by its assignee alone.

## Not here yet

- The "Try it" playground: the portal's
  `src/marketplace/resources/playground` is the code to move into a shared
  package.
- Changing a key's models or limits, pausing and deleting it.
- Spend over time: the key serializer serves this month only. Daily rows
  exist in the backend (`ResourceApiKeyDailyUsage`) but no endpoint returns
  them, and `usage_history` is not serialized.
- Per-model prices, context sizes or where a model runs: Waldur holds model
  names only.

## Running it

Under the portal, with the root app on its dev server:

```bash
yarn workspace waldur-ai-inference dev:subpath
```

then open `/ai-inference/` on the portal's origin. Standalone,
`yarn workspace waldur-ai-inference dev` serves on port 5183 and needs
`VITE_API_URL`.

## Demo on a local dev stack

`demo/` plays both sides without a gateway, on mastermind's dev stack with
the `my_infrastructure` preset loaded (projects "Demo Project" and
"ML Research"; users `member`, `manager`, `owner`).

1. Seed three inference offerings, two services in ML Research with four
   keys, and a `provider` user. It prints the provider's API token.

   ```bash
   waldur shell < apps/ai-inference/demo/seed.py
   ```

2. Run the fake provider as the `provider` user (its password is set in `seed.py`; it signs in again when its token expires). It approves and finishes orders
   for the demo offerings (with an endpoint), answers key commands with
   made-up values, and reports usage every few seconds, so keys fill up and
   pause at their limits.

   ```bash
   WALDUR_PASSWORD=<provider password> python3 apps/ai-inference/demo/fake_provider.py
   ```

Then, as `manager`, add a service or issue a key and watch it go from
requested to active; as `member`, reveal your key. Nothing answers at the
endpoints, so a real client call fails: the LiteLLM plugin of
waldur-site-agent with a mock LiteLLM is the way to a working one.
