import { Offering } from './types';

// tslint:disable:max-line-length
export const OFFERING: Offering = {
  url: 'http://localhost:8080/api/support-offerings/af8195ec67a148d9bac07c953b554e5f/',
  uuid: 'af8195ec67a148d9bac07c953b554e5f',
  name: 'asas',
  project: 'http://localhost:8080/api/projects/0b02d56ebb0d4c6cb00a0728b5d9f349/',
  type: 'oracle-iaas',
  template: 'http://localhost:8080/api/support-offering-templates/9b9247f70d594fbfa2852c1f6d643563/',
  template_uuid: '9b9247f70d594fbfa2852c1f6d643563',
  state: 'Requested',
  type_label: 'Oracle IAAS',
  unit_price: 10.00,
  unit: 'day',
  created: '2018-10-31T15:58:55.177810Z',
  modified: '2018-11-28T08:45:48.388173Z',
  issue: 'http://localhost:8080/api/support-issues/71b8d1484ba74103b7a282cb2e5f8a42/',
  issue_link: 'https://waldur-test.example.com/browse/WAL-390',
  issue_key: 'WAL-390',
  issue_description: 'Tenants: ---\nAdditional Info: \n- Organization: ActiveSys\n- Project: SaaS\n',
  issue_uuid: '71b8d1484ba74103b7a282cb2e5f8a42',
  issue_status: 'Waiting for support',
  project_name: 'SaaS',
  project_uuid: '0b02d56ebb0d4c6cb00a0728b5d9f349',
  product_code: '',
  article_code: '',
  report: [
    {
      header: 'Database instance info',
      body: 'ORACONF=TSTARDB\nDBTYPE=single-ha\nDBNAME=TSTARDB\nSIDNAME=TSTARDB\nDATABASE_CHARACTERSET=AR8MSWIN1256\nNODE1=ardb\nNODE1IP=192.168.42.120',
    },
    {
      header: 'SNAPSHOTS',
      body: 'Name                     CopyOf            CreationTime\nora-tstardb-asm01.170927 ora-tstardb-asm01 2017-09-27 23:30:01 GST\nora-tstardb-asm01.170928 ora-tstardb-asm01 2017-09-28 23:30:01 GST\nora-tstardb-asm01.170929 ora-tstardb-asm01 2017-09-29 23:30:01 GST\nora-tstardb-asm01.170930 ora-tstardb-asm01 2017-09-30 23:30:02 GST\nora-tstardb-asm01.171001 ora-tstardb-asm01 2017-10-01 23:30:01 GST\nora-tstardb-asm01.171002 ora-tstardb-asm01 2017-10-02 23:30:02 GST\nora-tstardb-asm01.171003 ora-tstardb-asm01 2017-10-03 23:30:01 GST\nora-tstardb-asm02.170927 ora-tstardb-asm02 2017-09-27 23:30:01 GST\nora-tstardb-asm02.170928 ora-tstardb-asm02 2017-09-28 23:30:01 GST\nora-tstardb-asm02.170929 ora-tstardb-asm02 2017-09-29 23:30:01 GST\nora-tstardb-asm02.170930 ora-tstardb-asm02 2017-09-30 23:30:02 GST\nora-tstardb-asm02.171001 ora-tstardb-asm02 2017-10-01 23:30:01 GST\nora-tstardb-asm02.171002 ora-tstardb-asm02 2017-10-02 23:30:02 GST\nora-tstardb-asm02.171003 ora-tstardb-asm02 2017-10-03 23:30:01 GST\nora-tstardb-sys.170927   ora-tstardb-sys   2017-09-27 23:30:01 GST\nora-tstardb-sys.170928   ora-tstardb-sys   2017-09-28 23:30:01 GST\nora-tstardb-sys.170929   ora-tstardb-sys   2017-09-29 23:30:01 GST\nora-tstardb-sys.170930   ora-tstardb-sys   2017-09-30 23:30:02 GST\nora-tstardb-sys.171001   ora-tstardb-sys   2017-10-01 23:30:01 GST\nora-tstardb-sys.171002   ora-tstardb-sys   2017-10-02 23:30:02 GST\nora-tstardb-sys.171003   ora-tstardb-sys   2017-10-03 23:30:01 GST\nora-tstardb-u01.170927   ora-tstardb-u01   2017-09-27 23:30:01 GST\nora-tstardb-u01.170928   ora-tstardb-u01   2017-09-28 23:30:01 GST\nora-tstardb-u01.170929   ora-tstardb-u01   2017-09-29 23:30:01 GST\nora-tstardb-u01.170930   ora-tstardb-u01   2017-09-30 23:30:02 GST\nora-tstardb-u01.171001   ora-tstardb-u01   2017-10-01 23:30:01 GST\nora-tstardb-u01.171002   ora-tstardb-u01   2017-10-02 23:30:02 GST\nora-tstardb-u01.171003   ora-tstardb-u01   2017-10-03 23:30:01 GST\n------------------------------------------------------------------\n',
    },
  ],
  marketplace_offering_uuid: '80b59d4796b1465faff47e0046283971',
};
