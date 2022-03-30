export const countryInfo = ({ data }) => {
  let providers = '';
  let consumers = '';
  data.providers.map((provider) => {
    providers += `<div class="card-body text-center">
                  <div class="m-b-sm">
                    <img alt="image" class="img-fluid rounded-circle img-center" src=${provider.logo}>
                  </div>
                  <h3 class="font-bold">${provider.name}</h3>
                  <div class="text-center">
                    <p>${provider.description}</p>
                  </div>
                </div>`;
  });
  data.consumers.map((consumer) => {
    consumers += `<div class="card-body text-center">
                  <div class="m-b-sm">
                    <img alt="image" class="img-fluid rounded-circle img-center" src=${consumer.logo}>
                  </div>
                  <h3 class="font-bold">${consumer.name}</h3>
                  <div class="text-center">
                    <p>${consumer.description}</p>
                  </div>
                </div>`;
  });
  const providersHeader =
    providers.length > 0
      ? `<div class="card-header">
                                                    <h5>Providers</h5>
                                                  </div>`
      : '';
  const consumersHeader =
    consumers.length > 0
      ? `<div class="card-header">
                                                    <h5>Consumers</h5>
                                                  </div>`
      : '';
  return `<div id="country-info" class="card">${
    providersHeader + providers + consumersHeader + consumers
  }</div>`;
};
