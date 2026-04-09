import { useMemo } from 'react';
import { useCurrencyStore, CURRENCIES } from './useCurrencyStore';

export const useCurrencyFormatter = () => {
  const currencyCode = useCurrencyStore((state) => state.currency);
  const currency = CURRENCIES[currencyCode];

  const formatCurrency = useMemo(() => {
    return (amount: number, options: { sign?: boolean; decimals?: number } = {}) => {
      const { sign = false, decimals = 2 } = options;
      
      const formatted = new Intl.NumberFormat(currencyCode === 'INR' ? 'en-IN' : 'en-US', {
        style: 'currency',
        currency: currencyCode,
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      }).format(Math.abs(amount));

      // Intl.NumberFormat includes the symbol. If we want custom control, we'd slice it, 
      // but standard formatting is usually better.
      
      const prefix = sign && amount !== 0 ? (amount > 0 ? '+ ' : '- ') : (amount < 0 ? '- ' : '');
      
      // If amount is negative, Intl.NumberFormat might already include the minus sign.
      // We take absolute for the formatter and handle the sign manually if requested for '+' prefix.
      
      return `${prefix}${formatted}`;
    };
  }, [currencyCode]);

  return {
    formatCurrency,
    currencySymbol: currency.symbol,
    currencyCode: currency.code,
  };
};
