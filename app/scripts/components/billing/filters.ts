import { Customer } from '@waldur/customer/types';

// phone numbers specification https://www.itu.int/rec/T-REC-E.164-201011-I
export function formatPhone(value) {
  if (value === undefined || value.national_number === undefined || value.country_code === undefined) {
    return value;
  }

  let nationalNumber = value.national_number || '';

  if (nationalNumber.length === 7) {
    nationalNumber = nationalNumber.replace(/(\d{3})(\d{2})(\d{2})/, '$1-$2-$3');
  } else if (nationalNumber.length === 10) {
    nationalNumber = nationalNumber.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');
  }

  return `(+${value.country_code})-${nationalNumber}`;
}

// This is temporary workaround until data migration is completed.
export const normalizeCustomerDetails = details => {
  // tslint:disable variable-name
  const name = details.name || details.company;
  const address = details.address || details.contact_details;
  const country = details.country_name || details.country;
  const postal = details.postal;
  const email = details.email;
  const vat_code = details.vat_code;
  const phone_number = details.phone_number || details.phone;
  const bank_name = details.bank_name || details.bank;
  const bank_account = details.bank_account || details.account;
  const customer: Customer = {
    name,
    address,
    country,
    postal,
    email,
    vat_code,
    phone_number,
    bank_name,
    bank_account,
  };
  return customer;
};
