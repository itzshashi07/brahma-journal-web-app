import Image from "next/image";
export function PhonePreview({
  src,
  alt,
  className = "",
  priority = false,
}: {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
}) {
  return (
    <div className={`phone-preview ${className}`}>
      <div className="phone-camera" aria-hidden="true" />
      <Image
        src={src}
        alt={alt}
        width={1080}
        height={1920}
        sizes="(max-width: 600px) 230px, 290px"
        priority={priority}
      />
    </div>
  );
}
