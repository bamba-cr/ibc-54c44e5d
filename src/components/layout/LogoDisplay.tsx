
import { useState, useEffect } from 'react';

export const LogoDisplay = ({ className = "" }: { className?: string }) => {
  const [logoUrl, setLogoUrl] = useState('');
  const [logoText, setLogoText] = useState('IBC CONNECT');

  useEffect(() => {
    const updateLogo = () => {
      const customLogo = localStorage.getItem('custom-logo');
      const customText = localStorage.getItem('logo-text');
      
      setLogoUrl(customLogo || '');
      setLogoText(customText || 'IBC CONNECT');
    };

    updateLogo();

    // Listen for storage changes
    window.addEventListener('storage', updateLogo);
    
    return () => window.removeEventListener('storage', updateLogo);
  }, []);

  if (logoUrl) {
    return (
      <img 
        src={logoUrl} 
        alt="Logo" 
        className={`max-h-8 max-w-32 object-contain ${className}`}
        onError={() => setLogoUrl('')}
      />
    );
  }

  return (
    <span className={`text-2xl font-milker text-primary bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent ${className}`}>
      {logoText}
    </span>
  );
};
