import { CopyToClipboardButton } from '@/core/CopyToClipboardButton';

export const IPList = ({ value }) => {
  if (Array.isArray(value) && value.filter(Boolean).length > 0) {
    const ips = value.filter(Boolean);
    return (
      <>
        {ips.map((ip, idx) => (
          <span key={ip} className="text-nowrap">
            {ip}
            <CopyToClipboardButton
              value={ip}
              size={17}
              className="mx-1.5 hover:text-brand cursor-pointer inline z-index-1 position-relative"
            />
            {idx < ips.length - 1 ? <span className="me-1.5">,</span> : null}
          </span>
        ))}
      </>
    );
  }
  return <>–</>;
};
