'use client';

export default function CompanyLogo({ src, alt }) {
    if (!src) return null;

    return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
            src={src}
            alt={alt || "Company Logo"}
            className="h-16 object-contain"
        />
    );
}
