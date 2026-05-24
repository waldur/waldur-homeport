import { ThreadPrimitive } from '@assistant-ui/react';
import {
  CheckCircleIcon,
  PencilSimpleIcon,
  WarningCircleIcon,
  XCircleIcon,
} from '@phosphor-icons/react';
import {
  createContext,
  FC,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { SkeletonLoader } from '@/ai-assistant/components/shared/SkeletonLoader';
import { UIBlockProps } from '@/ai-assistant/lib/types';
import { CopyToClipboardButton } from '@/core/CopyToClipboardButton';
import { Link } from '@/core/Link';
import { Select } from '@/form/select';
import { translate } from '@/i18n';
import { useNotify } from '@/store/notify';

// Utility: Generate avatar initials from VM name
const getInitials = (name: string): string => {
  const words = name.split('-').filter(Boolean);
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

// Reusable VM preview card (avatar + name + project/org + optional flavor badge)
const VMPreviewCard: FC<{
  name?: string;
  project?: string;
  organization?: string;
  flavor?: string;
  orderId?: string;
  success?: boolean;
  className?: string;
  image?: string;
  network?: string;
  ssh_key_name?: string;
  system_volume_size?: number | string;
}> = ({
  name,
  project,
  organization,
  flavor,
  orderId,
  success,
  className,
  image,
  network,
  ssh_key_name,
  system_volume_size,
}) => (
  <div
    className={[
      'aui-vm-order-preview',
      success ? 'aui-vm-order-preview--success' : '',
      className ?? '',
    ]
      .filter(Boolean)
      .join(' ')}
  >
    <div className="aui-vm-order-preview-avatar">
      {name ? getInitials(name) : 'VM'}
    </div>
    <div className="aui-vm-order-preview-content">
      <div className="aui-vm-order-preview-name">
        {orderId ? (
          <Link
            state="marketplace-orders.details"
            params={{ order_uuid: orderId }}
          >
            {name || translate('VM')}
          </Link>
        ) : (
          name || translate('VM')
        )}
      </div>
      {project && (
        <div className="aui-vm-order-preview-project">
          {translate('Project')}: {project}
        </div>
      )}
      {organization && (
        <div className="aui-vm-order-preview-project">
          {translate('Organization')}: {organization}
        </div>
      )}
    </div>
    <div className="aui-vm-order-preview-details">
      {flavor && (
        <div className="aui-vm-order-preview-detail-row">
          <span className="aui-vm-order-preview-detail-label">
            {translate('Size')}
          </span>
          <span className="aui-vm-order-preview-detail-value">{flavor}</span>
        </div>
      )}
      {image && (
        <div className="aui-vm-order-preview-detail-row">
          <span className="aui-vm-order-preview-detail-label">
            {translate('OS')}
          </span>
          <span className="aui-vm-order-preview-detail-value">{image}</span>
        </div>
      )}
      {network && (
        <div className="aui-vm-order-preview-detail-row">
          <span className="aui-vm-order-preview-detail-label">
            {translate('Network')}
          </span>
          <span className="aui-vm-order-preview-detail-value">{network}</span>
        </div>
      )}
      {ssh_key_name && (
        <div className="aui-vm-order-preview-detail-row">
          <span className="aui-vm-order-preview-detail-label">
            {translate('SSH Key')}
          </span>
          <span className="aui-vm-order-preview-detail-value">
            {ssh_key_name}
          </span>
        </div>
      )}
      {system_volume_size && (
        <div className="aui-vm-order-preview-detail-row">
          <span className="aui-vm-order-preview-detail-label">
            {translate('Volume')}
          </span>
          <span className="aui-vm-order-preview-detail-value">
            {system_volume_size} GB
          </span>
        </div>
      )}
    </div>
  </div>
);

// Single-field select form (used for project_form and offering_form steps)
const SelectFormStep: FC<{
  intro: string;
  label: string;
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}> = ({ intro, label, options, value, onChange, placeholder }) => (
  <div className="aui-vm-order-block" data-has-actions="true">
    <div className="aui-vm-order-intro mb-3">{intro}</div>
    <div className="aui-vm-order-form">
      <div className="aui-vm-order-form-field">
        <label className="aui-vm-order-form-label">
          {label} <span className="text-danger">*</span>
        </label>
        <Select
          value={value ? options.find((opt) => opt.value === value) : null}
          onChange={(option: any) => onChange(option?.value || '')}
          options={options}
          placeholder={placeholder}
          isClearable
        />
      </div>
    </div>
  </div>
);

// Context to share form state between VMOrderBlock and VMOrderActions
interface VMOrderFormState {
  selectedFlavor: string;
  setSelectedFlavor: (value: string) => void;
  selectedImage: string;
  setSelectedImage: (value: string) => void;
  selectedProject: string;
  setSelectedProject: (value: string) => void;
  selectedOffering: string;
  setSelectedOffering: (value: string) => void;
}

const VMOrderFormContext = createContext<VMOrderFormState | null>(null);

export const VMOrderFormProvider: FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [selectedFlavor, setSelectedFlavor] = useState<string>('');
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [selectedOffering, setSelectedOffering] = useState<string>('');

  const value = useMemo(
    () => ({
      selectedFlavor,
      setSelectedFlavor,
      selectedImage,
      setSelectedImage,
      selectedProject,
      setSelectedProject,
      selectedOffering,
      setSelectedOffering,
    }),
    [selectedFlavor, selectedImage, selectedProject, selectedOffering],
  );

  return (
    <VMOrderFormContext.Provider value={value}>
      {children}
    </VMOrderFormContext.Provider>
  );
};

const useVMOrderForm = () => {
  const context = useContext(VMOrderFormContext);
  if (!context) {
    // Return dummy state if context not available (shouldn't happen in normal flow)
    return {
      selectedFlavor: '',
      setSelectedFlavor: () => {},
      selectedImage: '',
      setSelectedImage: () => {},
      selectedProject: '',
      setSelectedProject: () => {},
      selectedOffering: '',
      setSelectedOffering: () => {},
    };
  }
  return context;
};

/**
 * VMOrderBlock component for displaying VM creation order.
 * Shows form mode (flavor/image selection), preview mode, or result state.
 */
export const VMOrderBlock: FC<UIBlockProps> = ({ block }) => {
  const { showSuccess } = useNotify();
  const {
    selectedFlavor,
    setSelectedFlavor,
    selectedImage,
    setSelectedImage,
    selectedProject,
    setSelectedProject,
    selectedOffering,
    setSelectedOffering,
  } = useVMOrderForm();

  // Show success notification when VM creation completes
  useEffect(() => {
    if (block.order_status === 'success' && !block.error) {
      showSuccess(translate('Operation completed successfully'));
    }
  }, [block.order_status, block.error]);

  const isLoading = block.status === 'loading';
  if (isLoading) {
    return (
      <div className="aui-vm-order-block">
        <SkeletonLoader />
      </div>
    );
  }

  const hasError = !!block.error;
  // `order_status` is only set on the live path (blockManager renames the wire
  // `status` field). The audit log reads the raw persisted block where that
  // rename hasn't happened, so fall back to `order_id` — only present once
  // the VM creation has completed — as a result-state signal.
  const isResult =
    block.order_status === 'success' ||
    block.order_status === 'error' ||
    hasError ||
    !!block.order_id;

  // Project form mode - show project selector
  if (block.order_status === 'project_form' && block.projects) {
    return (
      <SelectFormStep
        intro={translate('Please select a project to create your VM in.')}
        label={translate('Project')}
        options={block.projects.map((p) => ({
          value: p.uuid,
          label: `${p.name} — ${p.organization}`,
        }))}
        value={selectedProject}
        onChange={setSelectedProject}
        placeholder={translate('Select a project...')}
      />
    );
  }

  // Offering form mode - show cloud provider selector
  if (block.order_status === 'offering_form' && block.offerings) {
    return (
      <SelectFormStep
        intro={translate('Please select a cloud provider for your VM.')}
        label={translate('Cloud provider')}
        options={block.offerings.map((o) => ({ value: o.uuid, label: o.name }))}
        value={selectedOffering}
        onChange={setSelectedOffering}
        placeholder={translate('Select a cloud provider...')}
      />
    );
  }

  // Form mode - show flavor/image selectors
  if (block.order_status === 'form' && block.flavors && block.images) {
    const hasFlavors = block.flavors.length > 0;
    const hasImages = block.images.length > 0;

    // Transform flavors into react-select options
    const flavorOptions = block.flavors.map((flavor) => ({
      value: flavor.name,
      label: `${flavor.name} (${flavor.cores} ${flavor.cores === 1 ? translate('vCPU') : translate('vCPUs')}, ${(flavor.ram / 1024).toFixed(0)} GB RAM)`,
    }));

    // Transform images into react-select options
    const imageOptions = block.images.map((image) => ({
      value: image.name,
      label: image.name,
    }));

    return (
      <div className="aui-vm-order-block" data-has-actions="true">
        {/* Intro text */}
        <div className="aui-vm-order-intro mb-3">
          {translate('Please select a flavor and image for your VM.')}
        </div>

        {/* Section heading */}
        <h4 className="aui-vm-order-heading mb-3">
          {translate('Configure your VM:')}
        </h4>

        {/* Preview-style card with avatar */}
        <VMPreviewCard
          name={block.name}
          project={block.project}
          organization={block.organization}
          image={block.image}
          network={block.network}
          ssh_key_name={block.ssh_key_name}
          system_volume_size={block.system_volume_size}
          className="mb-4"
        />

        {/* No options available message */}
        {(!hasFlavors || !hasImages) && (
          <div className="alert alert-warning">
            {(() => {
              if (!hasFlavors && !hasImages)
                return translate('No flavors or images available.');
              if (!hasFlavors) return translate('No flavors available.');
              return translate('No images available.');
            })()}
          </div>
        )}

        {/* Form fields */}
        {hasFlavors && hasImages && (
          <div className="aui-vm-order-form">
            {/* Flavor selector */}
            <div className="aui-vm-order-form-field">
              <label className="aui-vm-order-form-label">
                {translate('VM Size')} <span className="text-danger">*</span>
              </label>
              <Select
                value={
                  selectedFlavor
                    ? flavorOptions.find((opt) => opt.value === selectedFlavor)
                    : null
                }
                onChange={(option: any) =>
                  setSelectedFlavor(option?.value || '')
                }
                options={flavorOptions}
                placeholder={translate('Select a flavor...')}
                isClearable
              />
            </div>

            {/* Image selector */}
            <div className="aui-vm-order-form-field">
              <label className="aui-vm-order-form-label">
                {translate('Operating System')}{' '}
                <span className="text-danger">*</span>
              </label>
              <Select
                value={
                  selectedImage
                    ? imageOptions.find((opt) => opt.value === selectedImage)
                    : null
                }
                onChange={(option: any) =>
                  setSelectedImage(option?.value || '')
                }
                options={imageOptions}
                placeholder={translate('Select an image...')}
                isClearable
              />
            </div>
          </div>
        )}
      </div>
    );
  }

  // Result/Success state
  if (isResult) {
    return (
      <div className="aui-vm-order-block">
        {/* Error state */}
        {hasError ? (
          <div className="aui-vm-order-result aui-vm-order-result--error">
            <div className="aui-vm-order-result-header">
              <div className="aui-vm-order-result-icon">
                <XCircleIcon size={24} weight="bold" />
              </div>
              <div className="aui-vm-order-result-message">
                {translate('VM Creation Failed')}
              </div>
            </div>

            {block.error && (
              <div className="aui-vm-order-result-error">
                <WarningCircleIcon size={20} weight="bold" />
                <span>{block.error}</span>
              </div>
            )}
          </div>
        ) : (
          // Success state - use preview-style card
          <>
            {block.message && (
              <div className="aui-vm-order-intro mb-3">{block.message}</div>
            )}
            <h4 className="aui-vm-order-heading mb-3">
              {translate('VM order created successfully!')}
            </h4>
            {/* Preview-style card with avatar and badge */}
            <VMPreviewCard
              name={block.name}
              project={block.project}
              organization={block.organization}
              flavor={block.flavor}
              image={block.image}
              network={block.network}
              ssh_key_name={block.ssh_key_name}
              system_volume_size={block.system_volume_size}
              orderId={block.order_id}
              success
            />
            {/* Order ID with copy button */}
            {block.order_id && (
              <div className="aui-vm-order-id mt-3">
                <span className="aui-vm-order-id-label">
                  {translate('Order ID')}:
                </span>
                <Link
                  state="marketplace-orders.details"
                  params={{ order_uuid: block.order_id }}
                >
                  <code>{block.order_id}</code>
                </Link>
                <CopyToClipboardButton
                  value={block.order_id}
                  className="ms-2"
                />
              </div>
            )}
          </>
        )}
      </div>
    );
  }

  // Preview/Confirmation state
  return (
    <div className="aui-vm-order-block" data-has-actions="true">
      {/* Section heading */}
      <h4 className="aui-vm-order-heading mb-3">
        {translate('Here is the preview of changes:')}
      </h4>

      {/* Preview card */}
      <VMPreviewCard
        name={block.name}
        project={block.project}
        organization={block.organization}
        flavor={block.flavor}
        image={block.image}
        network={block.network}
        ssh_key_name={block.ssh_key_name}
        system_volume_size={block.system_volume_size}
      />

      {/* Confirmation question */}
      <div className="aui-vm-order-confirm mt-4">
        {translate('Do you confirm these changes?')}
      </div>
    </div>
  );
};

// Continue button — active when a prompt is provided, disabled otherwise
const ContinueButton: FC<{ prompt?: string }> = ({ prompt }) =>
  prompt ? (
    <ThreadPrimitive.Suggestion
      prompt={prompt}
      send
      clearComposer={false}
      asChild
    >
      <button className="aui-vm-order-action-btn aui-vm-order-action-btn--primary">
        <CheckCircleIcon size={16} weight="bold" />
        {translate('Continue')}
      </button>
    </ThreadPrimitive.Suggestion>
  ) : (
    <button
      className="aui-vm-order-action-btn aui-vm-order-action-btn--primary"
      disabled
    >
      <CheckCircleIcon size={16} weight="bold" />
      {translate('Continue')}
    </button>
  );

// Reusable Modify button for both form and preview modes
const ModifyButton: FC = () => (
  <ThreadPrimitive.Suggestion
    prompt={translate('I want to modify VM configuration. What can i change?')}
    send
    clearComposer={false}
    asChild
  >
    <button className="aui-vm-order-action-btn aui-vm-order-action-btn--secondary">
      <PencilSimpleIcon size={16} weight="bold" />
      {translate('Modify')}
    </button>
  </ThreadPrimitive.Suggestion>
);

/**
 * Renders action buttons for VM order preview/form state.
 * These are rendered outside the message content box in the footer.
 */
export const VMOrderActions: FC<UIBlockProps> = ({ block }) => {
  const { selectedFlavor, selectedImage, selectedProject, selectedOffering } =
    useVMOrderForm();

  // Hide actions once the order has finalized — success, failure, or any
  // path that already produced an order_id. Mirrors VMOrderBlock's isResult
  // check so the footer doesn't outlive the result card.
  if (
    block.order_status === 'success' ||
    block.order_status === 'error' ||
    block.error ||
    block.order_id
  ) {
    return null;
  }

  if (block.order_status === 'offering_form') {
    return (
      <div className="aui-vm-order-actions">
        <ContinueButton
          prompt={
            selectedOffering ? `offering_uuid: ${selectedOffering}` : undefined
          }
        />
      </div>
    );
  }

  if (block.order_status === 'project_form') {
    return (
      <div className="aui-vm-order-actions">
        <ContinueButton
          prompt={
            selectedProject ? `project_uuid: ${selectedProject}` : undefined
          }
        />
      </div>
    );
  }

  return (
    <div className="aui-vm-order-actions">
      <ModifyButton />
      {block.order_status === 'form' ? (
        <ContinueButton
          prompt={
            selectedFlavor && selectedImage
              ? `I selected ${selectedFlavor} and ${selectedImage}`
              : undefined
          }
        />
      ) : (
        // Preview mode - Create button
        <ThreadPrimitive.Suggestion
          prompt={translate('proceed with creating the VM')}
          send
          clearComposer={false}
          asChild
        >
          <button className="aui-vm-order-action-btn aui-vm-order-action-btn--primary">
            <CheckCircleIcon size={16} weight="bold" />
            {translate('Create')}
          </button>
        </ThreadPrimitive.Suggestion>
      )}
    </div>
  );
};
