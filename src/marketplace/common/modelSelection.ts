import { Offering, Resource } from 'waldur-js-client';

// Alone in a model list it stands for every model: on a resource, every model
// the offering lists, including ones it adds later; on an API key, every model
// its resource allows. An empty list is no model.
export const ALL_MODELS = '*';

// The resource option that holds the resource's model selection.
const MODELS_OPTION = 'models';

export const isAllModels = (models?: unknown) =>
  Array.isArray(models) && models.length === 1 && models[0] === ALL_MODELS;

type ModelsOffering = Pick<Offering, 'plugin_options' | 'resource_options'>;

// A multiple-choice models option is a model selection on any offering: it
// takes every model, and an empty one is none. A single choice has no room for
// every model. Mirrors mastermind's model_lists.models_option.
const isModelSelection = (resourceOptions?: Offering['resource_options']) =>
  resourceOptions?.options?.[MODELS_OPTION]?.type === 'select_string_multi';

// It narrows a resource's keys only under key management
// (model_lists.narrows_keys).
const narrowsKeys = (offering?: ModelsOffering) =>
  Boolean(offering?.plugin_options?.enable_api_key_provisioning) &&
  isModelSelection(offering?.resource_options);

// The resource option a form renders with an All models tick, if any.
export const getAllModelsOption = (
  resourceOptions?: Offering['resource_options'],
) => (isModelSelection(resourceOptions) ? MODELS_OPTION : undefined);

// The models a resource allows its keys: the offering's, narrowed by the
// resource's selection. Null when the offering lists none, so a key has no
// model list to choose from.
export const getResourceModels = (
  offering: ModelsOffering | undefined,
  resource: Pick<Resource, 'options'>,
): string[] | null => {
  const choices: string[] =
    offering?.resource_options?.options?.[MODELS_OPTION]?.choices ?? [];
  if (!choices.length) {
    return null;
  }
  if (!narrowsKeys(offering)) {
    return choices;
  }
  const selected = (resource.options as Record<string, unknown> | undefined)?.[
    MODELS_OPTION
  ];
  // A resource that never chose is on every model; an unset single choice,
  // kept when the option became a multiple one, is stored as ''.
  if (
    selected === undefined ||
    selected === null ||
    selected === '' ||
    isAllModels(selected)
  ) {
    return choices;
  }
  const names: unknown[] = [].concat(selected);
  return choices.filter((model) => names.includes(model));
};
