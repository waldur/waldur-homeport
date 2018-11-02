export const renderOfferingComponents = offering => {
  if (offering.components) {
    return offering.components
      .map(component => component.type)
      .join(', ');
  }
};
