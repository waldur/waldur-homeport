import { FC, PropsWithChildren, ReactNode } from 'react';

import { FieldError } from '@/form';

interface K8sOptionCardProps {
  /** Label of the offering option. Names the block so that it is
   *  distinguishable from the options rendered around it. */
  label?: ReactNode;
  helpText?: ReactNode;
  required?: boolean;
  /** Field-level validation errors. `OptionsForm` cannot render these through
   *  `FormFieldError`: that component only shows an error once the field is
   *  touched, and the K8s forms never blur an input. */
  error?: string[] | string;
}

/**
 * Bounding card for a K8s cluster configuration option.
 *
 * The K8s forms render several `<h6>` sections of their own, so without an
 * enclosing box and a title they read as page sections rather than as a single
 * option — and whatever option comes next in `options.order` appears to belong
 * to the cluster configuration.
 */
export const K8sOptionCard: FC<PropsWithChildren<K8sOptionCardProps>> = ({
  label,
  helpText,
  required,
  error,
  children,
}) => (
  <div className="card card-bordered mb-5">
    <div className="card-body">
      {label && (
        <div className="mb-5">
          <h5 className="mb-1">
            {label}
            {required && <span className="text-danger ms-1">*</span>}
          </h5>
          {helpText && <p className="text-muted mb-0">{helpText}</p>}
        </div>
      )}
      {error && (
        <div className="mb-5">
          <FieldError error={error} />
        </div>
      )}
      {children}
    </div>
  </div>
);
