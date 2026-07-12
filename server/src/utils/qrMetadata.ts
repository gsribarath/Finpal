import type { ExpenseCategory } from '../services/aiCategorizationService';

export interface QrMerchantMetadata {
  merchantId?: string;
  merchantName?: string;
  upiId?: string;
  category?: string;
  subcategory?: string;
  city?: string;
  state?: string;
  merchantType?: string;
  verified?: boolean;
}

const CATEGORY_ALIASES: Record<string, ExpenseCategory> = {
  food: 'Food',
  restaurant: 'Food',
  cafe: 'Food',
  hotel: 'Food',
  groceries: 'Groceries',
  grocery: 'Groceries',
  supermarket: 'Groceries',
  shopping: 'Shopping',
  clothing: 'Shopping',
  apparel: 'Shopping',
  footwear: 'Shopping',
  personalcare: 'Shopping',
  personal_care: 'Shopping',
  salon: 'Shopping',
  transport: 'Transport',
  travel: 'Transport',
  fuel: 'Transport',
  entertainment: 'Entertainment',
  movie: 'Entertainment',
  cinema: 'Entertainment',
  healthcare: 'Healthcare',
  health: 'Healthcare',
  medical: 'Healthcare',
  pharmacy: 'Healthcare',
  medicine: 'Healthcare',
  education: 'Education',
  stationery: 'Education',
  books: 'Education',
  printing: 'Education',
  utilities: 'Utilities',
  rent: 'Rent',
  emi: 'EMI',
  investment: 'Investment',
  gift: 'Gift',
  donation: 'Gift',
  salary: 'Salary',
};

function normalizeKey(value?: string): string {
  return (value || '').toLowerCase().replace(/[^a-z0-9]+/g, '');
}

export function extractQrMetadataFromNotes(notes?: Record<string, string> | null): QrMerchantMetadata | null {
  if (!notes) return null;

  const metadata: QrMerchantMetadata = {
    merchantId: notes.merchantId || notes.merchantid,
    merchantName: notes.merchantName || notes.merchantname,
    upiId: notes.upiId || notes.upiid || notes.pa,
    category: notes.category,
    subcategory: notes.subcategory,
    city: notes.city,
    state: notes.state,
    merchantType: notes.merchantType || notes.merchanttype,
    verified: typeof notes.verified === 'string' ? notes.verified.toLowerCase() === 'true' : undefined,
  };

  const hasMetadata = Object.values(metadata).some((value) => value !== undefined && value !== '');
  return hasMetadata ? metadata : null;
}

export function resolveExpenseCategoryFromQrMetadata(metadata?: QrMerchantMetadata | null): ExpenseCategory | null {
  if (!metadata) return null;

  const directMatch = CATEGORY_ALIASES[normalizeKey(metadata.category)];
  if (directMatch) return directMatch;

  const typeMatch = CATEGORY_ALIASES[normalizeKey(metadata.merchantType)];
  if (typeMatch) return typeMatch;

  const subcategoryMatch = CATEGORY_ALIASES[normalizeKey(metadata.subcategory)];
  if (subcategoryMatch) return subcategoryMatch;

  return null;
}
