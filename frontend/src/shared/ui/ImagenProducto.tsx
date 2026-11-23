import React, { useState } from "react";

interface ImagenProductoProps {
  src: string | null | undefined;
  alt: string;
  className: string;
  fallbackClassName: string;
}

/** Muestra la imagen del producto; si no hay URL o no carga, muestra un ícono. */
export const ImagenProducto: React.FC<ImagenProductoProps> = ({
  src,
  alt,
  className,
  fallbackClassName,
}) => {
  const [fallida, setFallida] = useState<string | null>(null);

  if (!src || fallida === src) {
    return (
      <div className={fallbackClassName} role="img" aria-label={alt}>
        🍽️
      </div>
    );
  }

  return (
    <img src={src} alt={alt} className={className} onError={() => setFallida(src)} />
  );
};
