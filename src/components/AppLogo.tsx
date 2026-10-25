import React from 'react';
import logoImg from '../assets/images/Logo.png';

interface AppLogoProps {
  className?: string;
  size?: number | string;
  alt?: string;
}

export const AppLogo: React.FC<AppLogoProps> = ({
  className = 'w-[54px] h-[54px]',
  size,
  alt = 'Scratch The Win Logo',
}) => {
  return (
    <img
      src={logoImg}
      alt={alt}
      className={`object-contain rounded-full select-none pointer-events-none drop-shadow-sm ${className}`}
      style={size ? { width: size, height: size } : undefined}
      draggable={false}
      onError={(e) => {
        // Fallback to direct public path if needed
        const target = e.currentTarget;
        if (target.src !== '/Logo.png') {
          target.src = '/Logo.png';
        }
      }}
    />
  );
};

export default AppLogo;
