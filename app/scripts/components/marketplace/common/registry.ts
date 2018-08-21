const REGISTRY = {};

export function registerFormComponent(offeringType, formComponent) {
  REGISTRY[offeringType] = formComponent;
}

export function getFormComponent(offeringType) {
  return REGISTRY[offeringType];
}
