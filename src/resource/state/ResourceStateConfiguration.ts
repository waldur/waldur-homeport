class ResourceStateConfiguration {
  private resourceStates = {};

  register(type, states) {
    this.resourceStates[type] = states;
  }

  $get() {
    return this.resourceStates;
  }
}

export const ResourceStateConfigurationProvider = new ResourceStateConfiguration();
