import React, { useEffect, useState } from 'react';
import { getCurrencySymbol } from '../../../utils/currencyUtils';

interface CurrencyDisplayProps {
  amount: number;
  currency: string;
  originalAmount?: number;
  originalCurrency?: string;
  showTooltip?: boolean;
  size?: 'small' | 'medium' | 'large';
  showCurrencyTag?: boolean;
}

const CurrencyDisplay: React.FC<CurrencyDisplayProps> = ({
  amount,
  currency,
  originalAmount,
  originalCurrency,
  showTooltip = true,
  size = 'medium',
  showCurrencyTag = true
}) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Dark mode detection
  useEffect(() => {
    const checkDarkMode = () => {
      const isDark = document.documentElement.classList.contains('dark-mode') || 
                     document.body.classList.contains('dark-mode');
      setIsDarkMode(isDark);
    };

    checkDarkMode();
    
    // Create observer for class changes
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });

    return () => observer.disconnect();
  }, []);

  const symbol = getCurrencySymbol(currency);
  const originalSymbol = originalCurrency ? getCurrencySymbol(originalCurrency) : null;
  
  const sizeStyles = {
    small: { fontSize: '0.875rem' },
    medium: { fontSize: '1rem' },
    large: { fontSize: '1.25rem' }
  };

  const formatAmount = (amt: number, curr: string) => {
    const sym = getCurrencySymbol(curr);
    switch (curr) {
      case 'JPY':
        return `${sym}${amt.toFixed(0)}`;
      case 'RON':
        return `${amt.toFixed(2)} ${sym}`;
      default:
        return `${sym}${amt.toFixed(2)}`;
    }
  };

  const hasConversion = originalAmount !== undefined && originalCurrency && originalCurrency !== currency;
  
  const tooltipText = hasConversion 
    ? `Original: ${formatAmount(originalAmount, originalCurrency)} | Converted: ${formatAmount(amount, currency)}`
    : `${formatAmount(amount, currency)}`;

  // Dark mode aware styles
  const getCurrencyTagStyle = () => ({
    marginLeft: '0.25rem',
    padding: '0.125rem 0.25rem',
    backgroundColor: hasConversion 
      ? (isDarkMode ? '#78350f' : '#fef3c7')
      : (isDarkMode ? '#374151' : '#f3f4f6'),
    color: hasConversion 
      ? (isDarkMode ? '#fbbf24' : '#92400e')
      : (isDarkMode ? '#9ca3af' : '#6b7280'),
    borderRadius: '0.25rem',
    fontSize: '0.75rem',
    fontWeight: 500,
    border: hasConversion 
      ? (isDarkMode ? '1px solid #a16207' : '1px solid #fcd34d')
      : (isDarkMode ? '1px solid #4b5563' : '1px solid #d1d5db')
  });

  const getConversionTextStyle = () => ({
    marginLeft: '0.25rem',
    color: isDarkMode ? '#9ca3af' : '#6b7280',
    fontSize: '0.75rem'
  });

  return (
    <span
      style={{
        ...sizeStyles[size],
        fontWeight: size === 'large' ? 600 : 500,
        position: 'relative',
        cursor: showTooltip && hasConversion ? 'help' : 'default'
      }}
      title={showTooltip ? tooltipText : undefined}
    >
      {formatAmount(amount, currency)}
      {showCurrencyTag && (
        <span style={getCurrencyTagStyle()}>
          {currency}
        </span>
      )}
      {hasConversion && showTooltip && (
        <span style={getConversionTextStyle()}>
          (from {originalSymbol}{originalAmount?.toFixed(2)} {originalCurrency})
        </span>
      )}
    </span>
  );
};

export default CurrencyDisplay;
