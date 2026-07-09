/**
 * AI-Based Expense Categorization Service
 * Multi-stage merchant intelligence pipeline:
 * 1. Normalize merchant text
 * 2. Check learned merchant overrides
 * 3. Match against a merchant knowledge base
 * 4. Apply fuzzy matching for spelling variations
 * 5. Fall back to AI semantic classification
 */
import mongoose from 'mongoose';
import OpenAI from 'openai';
import config from '../config';
import MerchantCategoryRule from '../models/MerchantCategoryRule';

export const EXPENSE_CATEGORIES = [
  'Food',
  'Groceries',
  'Shopping',
  'Transport',
  'Entertainment',
  'Utilities',
  'Healthcare',
  'Education',
  'Rent',
  'EMI',
  'Salary',
  'Investment',
  'Gift',
  'Other',
] as const;

export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number];

type MatchSource = 'manual' | 'knowledge-base' | 'fuzzy' | 'ai' | 'fallback';

export interface CategorizationResult {
  category: ExpenseCategory;
  confidence: number;
  reasoning: string;
  matchedKeyword?: string;
  matchedMerchant?: string;
  normalizedMerchant?: string;
  source?: MatchSource;
}

interface KnowledgeBaseEntry {
  category: ExpenseCategory;
  merchants: string[];
  keywords: string[];
}

interface CandidateMatch {
  category: ExpenseCategory;
  confidence: number;
  reasoning: string;
  matchedKeyword?: string;
  matchedMerchant?: string;
  normalizedMerchant?: string;
  source: MatchSource;
}

const categoryCache = new Map<string, CategorizationResult>();
const CACHE_MAX_SIZE = 500;
const FUZZY_MATCH_THRESHOLD = 0.8;

const STOP_WORDS = new Set([
  'limited',
  'ltd',
  'private',
  'pvt',
  'llp',
  'inc',
  'co',
  'company',
  'india',
  'ind',
  'store',
  'stores',
  'shop',
  'shops',
  'online',
  'payment',
  'transfer',
  'upi',
  'pay',
  'to',
  'from',
  'txn',
  'txnid',
  'transaction',
  'ref',
  'reference',
  'rrn',
  'utr',
  'vpa',
  'id',
  'no',
  'number',
  'bill',
  'billpayment',
  'pymt',
  'paymentid',
  'order',
  'receipt',
  'invoice',
  'card',
  'bank',
]);

const KNOWLEDGE_BASE: KnowledgeBaseEntry[] = [
  {
    category: 'Food',
    merchants: [
      'swiggy',
      'zomato',
      'dominos',
      'domino s',
      'mcdonalds',
      'mcdonald s',
      'kfc',
      'burger king',
      'subway',
      'pizza hut',
      'a2b',
      'saravana bhavan',
      'briyani',
      'biriyani',
      'biryani',
      'restaurant',
      'cafe',
      'canteen',
      'mess',
      'hotel',
      'bakery',
      'fast food',
      'food court',
      'juice shop',
      'tea stall',
      'biryani house',
      'biryani corner',
      'instamart food',
      'blinkit food',
      'barbeque',
      'bbq',
      'parotta',
      'dosa',
      'thali',
      'juice',
      'chai',
      'coffee',
      'snacks',
      'snack',
    ],
    keywords: [
      'food',
      'meal',
      'lunch',
      'dinner',
      'breakfast',
      'biryani',
      'biriyani',
      'briyani',
      'dosa',
      'idli',
      'vada',
      'parotta',
      'paratha',
      'pizza',
      'burger',
      'coffee',
      'tea',
      'juice',
      'dessert',
      'cake',
      'pastry',
      'snack',
      'snacks',
      'restaurant',
      'cafe',
      'mess',
      'canteen',
      'hotel',
      'bakery',
      'dhaba',
      'eatery',
      'food court',
      'fast food',
      'thali',
    ],
  },
  {
    category: 'Groceries',
    merchants: ['bigbasket', 'blinkit', 'zepto', 'instamart', 'jiomart', 'grocery', 'supermarket'],
    keywords: ['grocery', 'groceries', 'vegetable', 'vegetables', 'fruit', 'fruits', 'kirana', 'supermarket', 'staples', 'provisions', 'milk', 'bread', 'eggs', 'rice', 'atta', 'oil', 'ghee', 'spices', 'masala'],
  },
  {
    category: 'Shopping',
    merchants: ['zudio', 'trends', 'reliance trends', 'max', 'pantaloons', 'lifestyle', 'myntra', 'ajio', 'amazon', 'flipkart', 'dmart', 'reliance smart', 'nykaa', 'meesho', 'snapdeal', 'textiles', 'fashion', 'clothing', 'footwear'],
    keywords: ['shopping', 'mall', 'store', 'shop', 'market', 'garment', 'fashion', 'apparel', 'footwear', 'shoes', 'accessories', 'cosmetics', 'retail', 'clothing', 'textiles', 'purchase', 'buy', 'order'],
  },
  {
    category: 'Education',
    merchants: ['printout', 'print out', 'printing', 'xerox', 'zerox', 'photocopy', 'stationery', 'book store', 'notebook', 'exam fee', 'college fee', 'school fee', 'tuition', 'library', 'hackathon', 'workshop', 'seminar', 'training', 'course', 'udemy', 'coursera', 'nptel'],
    keywords: ['education', 'school', 'college', 'university', 'tuition', 'course', 'coaching', 'books', 'exam', 'fee', 'admission', 'certificate', 'training', 'workshop', 'seminar', 'class', 'academy', 'institute', 'learning', 'study', 'notebook', 'stationery', 'hackathon', 'competition', 'contest', 'project', 'coding', 'bootcamp', 'conference', 'photocopy', 'xerox', 'printout', 'printing'],
  },
  {
    category: 'Transport',
    merchants: ['uber', 'ola', 'rapido', 'metro', 'bus', 'train', 'fuel', 'petrol', 'diesel', 'parking', 'fastag', 'auto', 'airtel fastag'],
    keywords: ['transport', 'travel', 'commute', 'ride', 'cab', 'taxi', 'rickshaw', 'metro', 'bus', 'train', 'irctc', 'petrol', 'diesel', 'fuel', 'parking', 'toll', 'flight', 'airline', 'uber', 'ola', 'rapido', 'auto'],
  },
  {
    category: 'Healthcare',
    merchants: ['hospital', 'clinic', 'medical', 'apollo', 'pharmacy', 'medicine', 'lab', 'health checkup'],
    keywords: ['hospital', 'clinic', 'medical', 'medicine', 'apollo', 'pharmacy', 'medplus', 'netmeds', 'pharmeasy', 'diagnostic', 'lab', 'checkup', 'health', 'healthcare', 'consultation', 'prescription', 'therapy', 'physiotherapy'],
  },
  {
    category: 'Entertainment',
    merchants: ['movie', 'cinema', 'netflix', 'prime video', 'spotify', 'games', 'playstation', 'steam', 'bookmyshow'],
    keywords: ['movie', 'cinema', 'netflix', 'prime video', 'spotify', 'game', 'games', 'playstation', 'steam', 'bookmyshow', 'ott', 'streaming', 'entertainment', 'concert', 'ticket', 'festival', 'performance', 'show'],
  },
  {
    category: 'Utilities',
    merchants: ['electricity', 'eb bill', 'water bill', 'gas bill', 'internet', 'broadband', 'wifi', 'recharge', 'mobile bill', 'dth'],
    keywords: ['electricity', 'eb bill', 'water bill', 'gas', 'internet', 'broadband', 'wifi', 'recharge', 'mobile bill', 'dth', 'mobile recharge', 'bill payment', 'utility', 'utilities', 'phone bill'],
  },
  {
    category: 'Rent',
    merchants: ['rent', 'house rent', 'pg rent', 'room rent', 'hostel', 'flat rent'],
    keywords: ['rent', 'house rent', 'pg rent', 'apartment', 'landlord', 'accommodation', 'hostel', 'room rent', 'flat rent', 'maintenance'],
  },
  {
    category: 'EMI',
    merchants: ['loan emi', 'emi', 'loan', 'installment', 'instalment', 'bajaj', 'finance'],
    keywords: ['emi', 'loan', 'installment', 'instalment', 'equated monthly', 'finance', 'credit card bill', 'personal loan', 'home loan', 'car loan'],
  },
  {
    category: 'Salary',
    merchants: ['salary', 'stipend', 'bonus', 'commission', 'freelance'],
    keywords: ['salary', 'wage', 'income', 'freelance', 'payment received', 'credit', 'earnings', 'stipend', 'bonus', 'incentive', 'commission'],
  },
  {
    category: 'Investment',
    merchants: ['mutual fund', 'stock', 'zerodha', 'groww', 'upstox', 'sip', 'demat'],
    keywords: ['mutual fund', 'stock', 'investment', 'sip', 'fixed deposit', 'ppf', 'nps', 'trading', 'demat', 'portfolio', 'equity', 'bond', 'share', 'invest', 'gold'],
  },
  {
    category: 'Gift',
    merchants: ['gift', 'donation', 'charity', 'shagun', 'present'],
    keywords: ['gift', 'donation', 'charity', 'shagun', 'wedding gift', 'present', 'contribution', 'ngo', 'temple', 'church', 'mosque', 'gurudwara'],
  },
];

function getCacheKey(merchant: string, description?: string, notes?: string): string {
  return `${merchant || ''}|${description || ''}|${notes || ''}`.toLowerCase().trim();
}

function addToCache(key: string, result: CategorizationResult): void {
  if (categoryCache.size >= CACHE_MAX_SIZE) {
    const firstKey = categoryCache.keys().next().value;
    if (firstKey) categoryCache.delete(firstKey);
  }

  categoryCache.set(key, result);
}

function safeDecode(input: string): string {
  try {
    return decodeURIComponent(input);
  } catch {
    return input;
  }
}

function tokenize(value: string): string[] {
  return value
    .split(/\s+/)
    .map((token) => token.trim())
    .filter(Boolean);
}

function compact(value: string): string {
  return value.replace(/\s+/g, '');
}

function normalizeForMatch(value: string): string {
  return normalizeMerchantName(value).toLowerCase();
}

export function normalizeMerchantName(value: string): string {
  if (!value) return '';

  let text = safeDecode(value).toLowerCase().trim();

  // Keep the business name before UPI IDs / references and remove trailing metadata.
  text = text.replace(/\b(upi|vpa|txn|txnid|transaction|ref|reference|rrn|utr|id|no|number)\b[\s:\-#]*[a-z0-9]+/gi, ' ');
  text = text.replace(/@[a-z]{2,}$/gi, ' ');
  text = text.replace(/[|\/\\:;(),.\[\]{}<>]/g, ' ');
  text = text.replace(/[^a-z0-9\s]+/gi, ' ');

  const tokens = tokenize(text)
    .map((token) => token.replace(/[^a-z0-9]/g, ''))
    .filter((token) => token.length > 0)
    .filter((token) => !/^[0-9]+$/.test(token))
    .filter((token) => !STOP_WORDS.has(token));

  const deduped: string[] = [];
  for (const token of tokens) {
    if (!deduped.includes(token)) {
      deduped.push(token);
    }
  }

  return deduped.join(' ').trim();
}

function humanizeMerchant(merchant: string): string {
  const normalized = normalizeMerchantName(merchant);
  if (!normalized) return merchant.trim();

  return normalized
    .split(' ')
    .map((token) => token.charAt(0).toUpperCase() + token.slice(1))
    .join(' ');
}

function levenshteinDistance(left: string, right: string): number {
  if (left === right) return 0;
  if (!left.length) return right.length;
  if (!right.length) return left.length;

  const previousRow = Array.from({ length: right.length + 1 }, (_, index) => index);

  for (let i = 1; i <= left.length; i += 1) {
    const currentRow = [i];
    for (let j = 1; j <= right.length; j += 1) {
      const insertion = currentRow[j - 1] + 1;
      const deletion = previousRow[j] + 1;
      const substitution = previousRow[j - 1] + (left[i - 1] === right[j - 1] ? 0 : 1);
      currentRow.push(Math.min(insertion, deletion, substitution));
    }
    for (let j = 0; j < previousRow.length; j += 1) {
      previousRow[j] = currentRow[j];
    }
  }

  return previousRow[right.length];
}

function similarity(left: string, right: string): number {
  const normalizedLeft = compact(normalizeForMatch(left));
  const normalizedRight = compact(normalizeForMatch(right));

  if (!normalizedLeft || !normalizedRight) return 0;
  if (normalizedLeft === normalizedRight) return 1;

  const distance = levenshteinDistance(normalizedLeft, normalizedRight);
  return 1 - distance / Math.max(normalizedLeft.length, normalizedRight.length);
}

function buildCandidate(params: {
  category: ExpenseCategory;
  confidence: number;
  reasoning: string;
  source: MatchSource;
  matchedKeyword?: string;
  matchedMerchant?: string;
  normalizedMerchant?: string;
}): CandidateMatch {
  return {
    ...params,
    confidence: Math.min(1, Math.max(0, params.confidence)),
  };
}

function scoreMatch(
  normalizedMerchant: string,
  candidate: string,
  category: ExpenseCategory,
  kind: 'merchant' | 'keyword'
): CandidateMatch | null {
  const normalizedCandidate = normalizeForMatch(candidate);
  if (!normalizedMerchant || !normalizedCandidate) return null;

  const merchantCompact = compact(normalizedMerchant);
  const candidateCompact = compact(normalizedCandidate);

  if (normalizedMerchant === normalizedCandidate || merchantCompact === candidateCompact) {
    return buildCandidate({
      category,
      confidence: kind === 'merchant' ? 0.98 : 0.96,
      reasoning: `Exact ${kind} match: "${candidate}"`,
      source: 'knowledge-base',
      matchedKeyword: kind === 'keyword' ? candidate : undefined,
      matchedMerchant: kind === 'merchant' ? candidate : undefined,
      normalizedMerchant,
    });
  }

  if (
    normalizedMerchant.includes(normalizedCandidate) ||
    normalizedCandidate.includes(normalizedMerchant)
  ) {
    return buildCandidate({
      category,
      confidence: kind === 'merchant' ? 0.93 : 0.9,
      reasoning: `Substring ${kind} match: "${candidate}"`,
      source: 'knowledge-base',
      matchedKeyword: kind === 'keyword' ? candidate : undefined,
      matchedMerchant: kind === 'merchant' ? candidate : undefined,
      normalizedMerchant,
    });
  }

  const tokenOverlap = tokenize(normalizedMerchant).some((token) => token === normalizedCandidate);
  if (tokenOverlap) {
    return buildCandidate({
      category,
      confidence: kind === 'merchant' ? 0.88 : 0.84,
      reasoning: `Token ${kind} match: "${candidate}"`,
      source: 'knowledge-base',
      matchedKeyword: kind === 'keyword' ? candidate : undefined,
      matchedMerchant: kind === 'merchant' ? candidate : undefined,
      normalizedMerchant,
    });
  }

  const score = similarity(normalizedMerchant, normalizedCandidate);
  if (score >= FUZZY_MATCH_THRESHOLD) {
    return buildCandidate({
      category,
      confidence: Math.max(0.8, Math.min(0.93, 0.72 + score * 0.2)),
      reasoning: `Fuzzy ${kind} match: "${candidate}"`,
      source: 'fuzzy',
      matchedKeyword: kind === 'keyword' ? candidate : undefined,
      matchedMerchant: kind === 'merchant' ? candidate : undefined,
      normalizedMerchant,
    });
  }

  return null;
}

function getKnowledgeBaseMatch(
  merchant: string,
  description?: string,
  notes?: string
): CandidateMatch | null {
  const normalizedMerchant = normalizeMerchantName(merchant);
  const searchableText = [normalizedMerchant, normalizeMerchantName(description || ''), normalizeMerchantName(notes || '')]
    .filter(Boolean)
    .join(' ')
    .trim();

  let bestCandidate: CandidateMatch | null = null;

  for (const entry of KNOWLEDGE_BASE) {
    for (const merchantName of entry.merchants) {
      const candidate = scoreMatch(normalizedMerchant, merchantName, entry.category, 'merchant');
      if (candidate && (!bestCandidate || candidate.confidence > bestCandidate.confidence)) {
        bestCandidate = candidate;
      }
    }

    for (const keyword of entry.keywords) {
      const normalizedKeyword = normalizeForMatch(keyword);
      if (!normalizedKeyword) continue;

      const textTokens = tokenize(searchableText);
      const exactKeywordMatch = textTokens.includes(normalizedKeyword) || searchableText.includes(normalizedKeyword);

      if (exactKeywordMatch) {
        const candidate = buildCandidate({
          category: entry.category,
          confidence: 0.9,
          reasoning: `Keyword match: "${keyword}"`,
          source: 'knowledge-base',
          matchedKeyword: keyword,
          matchedMerchant: humanizeMerchant(merchant),
          normalizedMerchant,
        });
        if (!bestCandidate || candidate.confidence > bestCandidate.confidence) {
          bestCandidate = candidate;
        }
        continue;
      }

      const candidate = scoreMatch(searchableText, keyword, entry.category, 'keyword');
      if (candidate && (!bestCandidate || candidate.confidence > bestCandidate.confidence)) {
        bestCandidate = candidate;
      }
    }
  }

  return bestCandidate;
}

export function categorizeMerchantDeterministically(params: {
  merchant: string;
  description?: string;
  notes?: string;
}): CategorizationResult {
  const normalizedMerchant = normalizeMerchantName(params.merchant);
  const knowledgeMatch = getKnowledgeBaseMatch(params.merchant, params.description, params.notes);

  if (knowledgeMatch) {
    return summarizeResult(knowledgeMatch);
  }

  return {
    category: 'Other',
    confidence: 0.2,
    reasoning: 'No deterministic match found',
    matchedMerchant: humanizeMerchant(params.merchant),
    normalizedMerchant,
    source: 'fallback',
  };
}

async function getManualOverride(
  merchant: string
): Promise<CandidateMatch | null> {
  const normalizedMerchant = normalizeMerchantName(merchant);
  if (!normalizedMerchant) return null;

  if (mongoose.connection.readyState !== 1) {
    return null;
  }

  try {
    const rule = await MerchantCategoryRule.findOne({
      normalizedMerchant,
      active: true,
    }).lean();

    if (!rule) return null;

    const category = EXPENSE_CATEGORIES.includes(rule.category as ExpenseCategory)
      ? (rule.category as ExpenseCategory)
      : 'Other';

    return buildCandidate({
      category,
      confidence: rule.confidenceScore || 0.99,
      reasoning: 'Learned merchant override',
      source: 'manual',
      matchedKeyword: rule.matchedKeyword,
      matchedMerchant: rule.matchedMerchant || rule.merchant,
      normalizedMerchant,
    });
  } catch {
    return null;
  }
}

export async function recordMerchantCategoryRule(params: {
  merchant: string;
  category: ExpenseCategory;
  confidenceScore?: number;
  matchedKeyword?: string;
  matchedMerchant?: string;
}): Promise<void> {
  const normalizedMerchant = normalizeMerchantName(params.merchant);
  if (!normalizedMerchant) return;

  await MerchantCategoryRule.findOneAndUpdate(
    { normalizedMerchant },
    {
      $set: {
        merchant: humanizeMerchant(params.merchant),
        normalizedMerchant,
        category: params.category,
        confidenceScore: Math.min(1, Math.max(0, params.confidenceScore ?? 0.99)),
        matchedKeyword: params.matchedKeyword,
        matchedMerchant: params.matchedMerchant || humanizeMerchant(params.merchant),
        source: 'manual',
        active: true,
      },
    },
    { upsert: true, new: true }
  );
}

/**
 * Clear the categorization cache - useful when updating rules
 */
export function clearCategorizationCache(): void {
  categoryCache.clear();
  console.log('Categorization cache cleared');
}

function summarizeResult(result: CandidateMatch | CategorizationResult): CategorizationResult {
  return {
    category: result.category,
    confidence: Math.min(1, Math.max(0, result.confidence)),
    reasoning: result.reasoning,
    matchedKeyword: result.matchedKeyword,
    matchedMerchant: result.matchedMerchant,
    normalizedMerchant: result.normalizedMerchant,
    source: result.source,
  };
}

function parseAiResponse(content: string): CategorizationResult | null {
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) return null;

  try {
    const parsed = JSON.parse(jsonMatch[0]);
    const category = EXPENSE_CATEGORIES.includes(parsed.category)
      ? (parsed.category as ExpenseCategory)
      : 'Other';

    return {
      category,
      confidence: Math.min(1, Math.max(0, parsed.confidence ?? 0.5)),
      reasoning: parsed.reasoning || 'AI classification',
      matchedKeyword: parsed.matchedKeyword,
      matchedMerchant: parsed.matchedMerchant,
      normalizedMerchant: parsed.normalizedMerchant,
      source: 'ai',
    };
  } catch {
    return null;
  }
}

/**
 * Classify a transaction using the full categorization pipeline.
 */
export async function categorizeTransaction(params: {
  merchant: string;
  description?: string;
  notes?: string;
  amount?: number;
}): Promise<CategorizationResult> {
  const cacheKey = getCacheKey(params.merchant, params.description, params.notes);
  const cached = categoryCache.get(cacheKey);
  if (cached) return cached;

  const normalizedMerchant = normalizeMerchantName(params.merchant);
  const manualOverride = await getManualOverride(params.merchant);
  if (manualOverride) {
    const result = summarizeResult({ ...manualOverride, normalizedMerchant });
    addToCache(cacheKey, result);
    return result;
  }

  const knowledgeMatch = getKnowledgeBaseMatch(params.merchant, params.description, params.notes);
  if (knowledgeMatch && knowledgeMatch.category !== 'Other') {
    const result = summarizeResult(knowledgeMatch);
    addToCache(cacheKey, result);
    return result;
  }

  if (config.openaiApiKey) {
    try {
      const openai = new OpenAI({ apiKey: config.openaiApiKey });
      const prompt = `You are a transaction categorizer for Indian UPI payments.

Return exactly one of these categories: ${EXPENSE_CATEGORIES.join(', ')}.

Transaction:
- Merchant: ${params.merchant}
${params.description ? `- Description: ${params.description}` : ''}
${params.notes ? `- Notes: ${params.notes}` : ''}
${params.amount ? `- Amount: ₹${params.amount}` : ''}

Rules:
- Normalize merchant names and infer the real merchant behind UPI handles or payment metadata.
- Prefer Food for biryani, dosa, restaurant, cafe, juice, tea, mess, canteen, etc.
- Prefer Shopping for fashion, apparel, textiles, Zudio, Amazon, Flipkart, DMart, stores, malls.
- Prefer Education for xerox, printout, stationery, tuition, course, college, hackathon, workshop, library.
- Prefer Transport for Uber, Ola, metro, bus, train, parking, fuel, toll, auto.
- Prefer Healthcare for hospital, clinic, pharmacy, medical, lab.
- Prefer Entertainment for Netflix, movie, cinema, games, OTT.
- Prefer Utilities for electricity, gas, water, internet, recharge, mobile bill.
- Use Other only if the merchant is truly ambiguous.

Respond with valid JSON only in this format:
{"category":"<category>","confidence":0.0,"reasoning":"<brief reason>","matchedKeyword":"<optional>","matchedMerchant":"<optional>"}`;

      const response = await openai.chat.completions.create({
        model: config.openaiModel || 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 140,
        temperature: 0.1,
      });

      const content = response.choices[0]?.message?.content?.trim() || '';
      const aiResult = parseAiResponse(content);
      if (aiResult && aiResult.category !== 'Other') {
        const result = summarizeResult({
          ...aiResult,
          normalizedMerchant,
          matchedMerchant: aiResult.matchedMerchant || humanizeMerchant(params.merchant),
        });
        addToCache(cacheKey, result);
        return result;
      }
    } catch (error) {
      console.error('AI categorization error, falling back to deterministic matching:', error);
    }
  }

  const fallback = knowledgeMatch
    ? summarizeResult(knowledgeMatch)
    : {
        category: 'Other' as ExpenseCategory,
        confidence: 0.2,
        reasoning: 'No confident merchant match found',
        matchedMerchant: humanizeMerchant(params.merchant),
        normalizedMerchant,
        source: 'fallback' as MatchSource,
      };

  addToCache(cacheKey, fallback);
  return fallback;
}

/**
 * Batch categorize multiple transactions.
 */
export async function batchCategorize(
  transactions: Array<{
    merchant: string;
    description?: string;
    notes?: string;
    amount?: number;
  }>
): Promise<CategorizationResult[]> {
  return Promise.all(transactions.map((transaction) => categorizeTransaction(transaction)));
}

export default {
  categorizeTransaction,
  batchCategorize,
  clearCategorizationCache,
  normalizeMerchantName,
  recordMerchantCategoryRule,
  EXPENSE_CATEGORIES,
};
