import { getSaml2IdentityProviders } from '@waldur/auth/saml2/api';

export const fetchIdentityProviderOptions = (query: string) =>
  getSaml2IdentityProviders(query).then(options => ({ options }));

export const redirectPost = (url: string, data: object) => {
  const form = document.createElement('form');
  document.body.appendChild(form);
  form.method = 'POST';
  form.action = url;
  for (const name in data) {
    if (data.hasOwnProperty(name)) {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = name;
      input.value = data[name];
      form.appendChild(input);
    }
  }
  form.submit();
};
