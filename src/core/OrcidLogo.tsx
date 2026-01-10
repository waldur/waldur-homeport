import { FunctionComponent } from 'react';

interface OrcidLogoProps {
  size?: number;
  className?: string;
}

/**
 * Official ORCID iD logo following ORCID brand guidelines.
 * @see https://info.orcid.org/brand-guidelines/
 */
export const OrcidLogo: FunctionComponent<OrcidLogoProps> = ({
  size = 24,
  className,
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 256 256"
    width={size}
    height={size}
    className={className}
    aria-label="ORCID iD"
  >
    <circle cx="128" cy="128" r="128" fill="#A6CE39" />
    <g fill="#fff">
      <path d="M86.3 186.2H70.9V79.1h15.4v107.1z" />
      <path d="M108.9 79.1h41.6c39.6 0 57 28.3 57 53.6 0 27.5-21.5 53.6-56.8 53.6h-41.8V79.1zm15.4 93.3h24.5c34.9 0 42.9-26.5 42.9-39.7 0-21.5-13.7-39.7-43.7-39.7h-23.7v79.4z" />
      <circle cx="78.6" cy="60.1" r="11.1" />
    </g>
  </svg>
);
