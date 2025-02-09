import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Remove Decimal import and use plain type
type DecimalLike = {
  toNumber(): number;
};

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export type CurrencyConfig = {
  currency: string;
  locale: string;
};

export const defaultCurrencyConfig: CurrencyConfig = {
  currency: 'USD',
  locale: 'en-US'
} as const;

export const formatDecimalPrice = (price: any): number => {
  if (!price) return 0;
  
  // Handle Decimal objects
  if (typeof price === 'object' && 'toNumber' in price) {
    return Number(price.toNumber().toFixed(2));
  }
  
  // Handle string or number
  const numPrice = Number(price);
  return Number(numPrice.toFixed(2));
};

// Update the formatter function
export const getFormatter = (config: CurrencyConfig = defaultCurrencyConfig) => {
  const safeConfig = {
    currency: config?.currency || defaultCurrencyConfig.currency,
    locale: config?.locale || defaultCurrencyConfig.locale
  };
  
  return new Intl.NumberFormat(safeConfig.locale, {
    style: 'currency',
    currency: safeConfig.currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

export const getNumberFormatter = (config: CurrencyConfig = defaultCurrencyConfig) => {
  return new Intl.NumberFormat(config.locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

// Get currency symbol
export const getCurrencySymbol = (config: CurrencyConfig = defaultCurrencyConfig) => {
  return getFormatter(config)
    .formatToParts(0)
    .find(part => part.type === 'currency')?.value || '$';
};

// Format price number only
export const formatPrice = (price: number | DecimalLike | null): number => {
  console.log('formatPrice input:', {
    price,
    type: typeof price,
    isDecimal: price instanceof Object && 'toNumber' in price
  });

  if (!price) {
    console.log('formatPrice: price is null/undefined');
    return 0;
  }
  
  if (typeof price === 'object' && 'toNumber' in price) {
    console.log('formatPrice: converting Decimal to number');
    const converted = price.toNumber();
    console.log('formatPrice: converted result:', converted);
    return converted;
  }
  
  console.log('formatPrice: direct number conversion');
  const numericPrice = Number(price);
  console.log('formatPrice: final result:', numericPrice);
  return !isNaN(numericPrice) ? numericPrice : 0;
};

// Format price as string without currency
export const formatPriceString = (price: number, config: CurrencyConfig = defaultCurrencyConfig): string => {
  return getNumberFormatter(config).format(price);
};

// Original format price function (keep for backwards compatibility)
export const formatPriceForClient = (price: any) => {
  const formatter = getFormatter();
  if (!price) return formatter.format(0);
  
  const numericPrice = formatPrice(price);
  return formatter.format(numericPrice);
};

export const getStoreSettings = (store: any) => {
  const defaultSettings = {
    currency: 'USD',
    locale: 'en-US'
  };

  if (!store?.storeSettings) return defaultSettings;

  try {
    const settings = typeof store.storeSettings === 'string' 
      ? JSON.parse(store.storeSettings)
      : store.storeSettings;
    
    return {
      currency: settings.currency || defaultSettings.currency,
      locale: settings.locale || defaultSettings.locale
    };
  } catch {
    return defaultSettings;
  }
};

export const getStoreConfig = (store: any): CurrencyConfig => {
  return {
    currency: store?.currency || 'USD',
    locale: store?.locale || 'en-US'
  };
};

export const safeParsePrice = (price: any): number => {
  if (!price) return 0;
  
  if (typeof price === 'object' && 'toNumber' in price) {
    return price.toNumber();
  }
  
  const numericPrice = Number(price);
  return !isNaN(numericPrice) ? numericPrice : 0;
};

export const validatePrice = (price: number, currency: string): number => {
  const numericPrice = Number(price);
  if (isNaN(numericPrice)) return 0;
  
  // Format to 2 decimal places for most currencies
  return Number(numericPrice.toFixed(2));
};
