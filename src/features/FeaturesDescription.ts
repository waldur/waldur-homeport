/* eslint-disable prettier/prettier */
// WARNING: This file is auto-generated from src/waldur_core/core/management/commands/print_features_description.py
// Do not edit it manually. All manual changes would be overridden.
import { FeatureSection } from '@waldur/features/types';
import { translate } from '@waldur/i18n';

export const FeaturesDescription: FeatureSection[] = [
  {
    key: 'customer',
    description: translate('Organization workspace'),
    items: [
      {
        key: 'payments_for_staff_only',
        description: translate('Make payments menu visible for staff users only.'),
      },
      {
        key: 'show_domain',
        description: translate('Allows to hide domain field in organization detail.'),
      },
    ],
  },
  {
    key: 'invitations',
    description: translate('Invitations management'),
    items: [
      {
        key: 'civil_number_required',
        description: translate('Make civil number field mandatory in invitation creation form.'),
      },
      {
        key: 'conceal_civil_number',
        description: translate('Conceal civil number in invitation creation dialog.'),
      },
      {
        key: 'require_user_details',
        description: translate('Render "Show user details" button in invitation creation form.'),
      },
      {
        key: 'show_tax_number',
        description: translate('Show tax number field in invitation creation form.'),
      },
      {
        key: 'tax_number_required',
        description: translate('Make tax number field mandatory in invitation creation form.'),
      },
    ],
  },
  {
    key: 'marketplace',
    description: translate('Marketplace offerings and resources'),
    items: [
      {
        key: 'conceal_prices',
        description: translate('Do not render prices in order details.'),
      },
      {
        key: 'import_resources',
        description: translate('Allow to import resources from service provider to project.'),
      },
      {
        key: 'lexis_links',
        description: translate('Enabled LEXIS link integrations for offerings.'),
      },
      {
        key: 'show_call_management_functionality',
        description: translate('Enabled display of call management functionality.'),
      },
      {
        key: 'show_experimental_ui_components',
        description: translate('Enabled display of experimental or mocked components in marketplace.'),
      },
    ],
  },
  {
    key: 'openstack',
    description: translate('OpenStack resources provisioning'),
    items: [
      {
        key: 'hide_volume_type_selector',
        description: translate('Allow to hide OpenStack volume type selector when instance or volume is provisioned.'),
      },
      {
        key: 'show_migrations',
        description: translate('Show OpenStack tenant migrations action and tab'),
      },
    ],
  },
  {
    key: 'project',
    description: translate('Project workspace'),
    items: [
      {
        key: 'estimated_cost',
        description: translate('Render estimated cost column in projects list.'),
      },
      {
        key: 'oecd_fos_2007_code',
        description: translate('Enable OECD code.'),
      },
      {
        key: 'show_description_in_create_dialog',
        description: translate('Show description field in project create dialog.'),
      },
      {
        key: 'show_end_date_in_create_dialog',
        description: translate('Show end date field in project create dialog.'),
      },
      {
        key: 'show_image_in_create_dialog',
        description: translate('Show image field in project create dialog.'),
      },
      {
        key: 'show_industry_flag',
        description: translate('Show industry flag.'),
      },
      {
        key: 'show_start_date_in_create_dialog',
        description: translate('Show start date field in project create dialog.'),
      },
      {
        key: 'show_type_in_create_dialog',
        description: translate('Show type field in project create dialog.'),
      },
    ],
  },
  {
    key: 'rancher',
    description: translate('Rancher resources provisioning'),
    items: [
      {
        key: 'volume_mount_point',
        description: translate('Allow to select mount point for data volume when Rancher cluster is provisioned.'),
      },
    ],
  },
  {
    key: 'slurm',
    description: translate('SLURM resources provisioning'),
    items: [
      {
        key: 'jobs',
        description: translate('Render list of SLURM jobs as a separate tab in allocation details page.'),
      },
    ],
  },
  {
    key: 'support',
    description: translate('Support workspace'),
    items: [
      {
        key: 'conceal_change_request',
        description: translate('Conceal "Change request" from a selection of issue types for non-staff/non-support users.'),
      },
      {
        key: 'pricelist',
        description: translate('Render marketplace plan components pricelist in support workspace.'),
      },
      {
        key: 'shared_providers',
        description: translate('Render overview of shared marketplace service providers in support workspace.'),
      },
      {
        key: 'users',
        description: translate('Render list of users in support workspace.'),
      },
      {
        key: 'vm_type_overview',
        description: translate('Enable VM type overview in support workspace.'),
      },
    ],
  },
  {
    key: 'telemetry',
    description: translate('Telemetry settings'),
    items: [
      {
        key: 'send_metrics',
        description: translate('Send telemetry metrics.'),
      },
    ],
  },
  {
    key: 'user',
    description: translate('User workspace'),
    items: [
      {
        key: 'disable_user_termination',
        description: translate('Disable user termination in user workspace.'),
      },
      {
        key: 'notifications',
        description: translate('Enable email and webhook notifications management in user workspace.'),
      },
      {
        key: 'preferred_language',
        description: translate('Render preferred language column in users list.'),
      },
      {
        key: 'show_slug',
        description: translate('Enable display of slug field in user summary.'),
      },
      {
        key: 'ssh_keys',
        description: translate('Enable SSH keys management in user workspace.'),
      },
    ],
  },
];

