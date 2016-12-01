export function randomDate() {
  return new Date(+(new Date()) - Math.floor(Math.random() * 10000000000));
}

export function randomChoice(items) {
  const i = Math.round(Math.random() * (items.length - 1));
  return items[i];
}

export function randomInteger(start, end) {
  return start + Math.round(Math.random() * (end - 1));
}

export function randomId() {
  return Math.floor((1 + Math.random()) * 0x100000).toString(10).toUpperCase()
}

export const randomText = () => randomChoice([
  'Desktop publishing packages and web page editors now use Lorem Ipsum as their default model text',
  'This is issue with the coresponding note',
  'There are many variations of passages of Lorem Ipsum available, but the majority have suffered',
  'Conference on the sales results for the previous year.'
]);

export const randomKey = () => `ISSUE-${randomInteger(10, 100)}`;

export const USERS = [
  {
    civil_number: 'EE3750815',
    phone_number: '+1-541-754-3010',
    email: 'victor.mireyev@gmail.com',
    preferred_language: 'Estonian',
    competence: 'CTO',
    username: 'Alice Lebowski',
    label: 'Alice Lebowski',
    role_deprecation_time: 'Unlimited',
    job_position: 'Administrator',
  },
  {
    civil_number: 'DE12345678',
    phone_number: '+49-89-636-48018',
    email: 'victor@opennodecloud.com',
    preferred_language: 'English',
    competence: 'OpenStack',
    role_deprecation_time: '1 year',
    username: 'Walter Lebowski',
    label: 'Walter Lebowski',
    job_position: 'System administrator'
  }
];

export const randomUser = () => randomChoice(USERS);
