// @ngInject
export default function gravatarServiceProviderConfig(gravatarServiceProvider) {
  gravatarServiceProvider.defaults = {
    size: 100,
    default: 'mm' // Mystery man as default for missing avatars
  };

  // Use https endpoint
  gravatarServiceProvider.secure = true;
}
