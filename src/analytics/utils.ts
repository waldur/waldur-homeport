export const formatFilter = vmFilter => {
  const vmFilterCopy = { ...vmFilter };
  if (vmFilter && vmFilter.service_provider) {
    vmFilterCopy.service_provider = vmFilter.service_provider.map(
      provider => provider.value,
    );
    return vmFilterCopy;
  }
  return vmFilter;
};

export const formatServiceProviders = serviceProviders => {
  return serviceProviders.map(serviceProvider => {
    return {
      value: serviceProvider.uuid,
      name: serviceProvider.name,
    };
  });
};
