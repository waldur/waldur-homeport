import Papa from 'papaparse';
import { Customer } from 'waldur-js-client';

import { email } from '@/core/validators';
import { isFeatureVisible } from '@/features/connect';
import { CustomerFeatures } from '@/FeaturesEnums';
import { translate } from '@/i18n';

import templateFile from './organizations_template.json';

interface IField {
  field: string;
  idx: number;
}

type RawCustomer = Partial<Customer>;

const bankingFieldKeys = ['bank_name', 'bank_account'];

const allCustomerOptionalFields = [
  { title: translate('Abbreviation'), key: 'abbreviation' },
  { title: translate('Address'), key: 'address' },
  { title: translate('Postal'), key: 'postal' },
  { title: translate('Country'), key: 'country' },
  { title: translate('Registration code'), key: 'registration_code' },
  { title: translate('Agreement number'), key: 'agreement_number' },
  { title: translate('Phone number'), key: 'phone_number' },
  { title: translate('Homepage'), key: 'homepage' },
  { title: translate('Bank name'), key: 'bank_name' },
  { title: translate('Bank account'), key: 'bank_account' },
  { title: translate('VAT code'), key: 'vat_code' },
  { title: translate('Default tax percent'), key: 'default_tax_percent' },
  { title: translate('Notification emails'), key: 'notification_emails' },
];

export const getCustomerOptionalFields = () =>
  isFeatureVisible(CustomerFeatures.show_banking_data)
    ? allCustomerOptionalFields
    : allCustomerOptionalFields.filter(
        (f) => !bankingFieldKeys.includes(f.key),
      );

export const parseOrganizationsFile = (file: File) => {
  return new Promise<RawCustomer[]>((resolve, reject) =>
    Papa.parse(file, {
      skipEmptyLines: true,
      complete: function (results: { data: Array<Array<string>> }) {
        if (Array.isArray(results?.data) && Array.isArray(results?.data[0])) {
          const header = results.data[0];

          const fields = templateFile.fields;
          const orgFields = header.reduce<IField[]>((acc, field, idx) => {
            if (fields.includes(field)) {
              acc.push({ field, idx });
            }
            return acc;
          }, []);
          const rows = results.data.slice(1);

          const organizations = rows.map((row) => {
            const organizationData: RawCustomer = {};
            orgFields.forEach(({ field, idx }) => {
              organizationData[field] = String(row[idx]).trim();
            });
            return organizationData;
          });

          resolve(organizations);
        }
        resolve([]);
      },
      error: function (error) {
        reject(error);
      },
    }),
  );
};

export const validateOrganizationCreation = (record: RawCustomer) => {
  const hasName = Boolean(record.name);
  const hasEmail = Boolean(record.email);
  const validEmail = !email(record.email);
  const validTax =
    !record.default_tax_percent || !isNaN(Number(record.default_tax_percent));
  return {
    valid: hasName && hasEmail && validEmail && validTax,
    errors: [
      hasName ? null : 'name',
      hasEmail ? null : 'email',
      validEmail ? null : 'invalid_email',
      validTax ? null : 'invalid_tax',
    ].filter(Boolean),
  };
};

export const deleteDuplicateRecords = (data: any[], keys: string[]) => {
  const seen = new Set();
  let duplicates = 0;
  const uniqueRows = data.filter((row) => {
    if (keys.some((k) => !row[k])) return true; // if a key is missing in the record, let it be
    const key = keys.map((k) => row[k]).join('-');
    if (seen.has(key)) {
      duplicates++;
      return false;
    }
    seen.add(key);
    return true;
  });
  return { duplicates, rows: uniqueRows };
};
