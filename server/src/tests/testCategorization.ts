import assert from 'assert';
import {
  categorizeMerchantDeterministically,
  normalizeMerchantName,
} from '../services/aiCategorizationService';

const normalizationCases = [
  { input: 'ZUDIO@ibl', expected: 'zudio' },
  { input: 'SWIGGY LIMITED', expected: 'swiggy' },
  { input: 'XEROX SHOP', expected: 'xerox' },
  { input: 'A2B RESTAURANT', expected: 'a2b restaurant' },
];

for (const testCase of normalizationCases) {
  assert.strictEqual(
    normalizeMerchantName(testCase.input),
    testCase.expected,
    `Normalization failed for ${testCase.input}`
  );
}

const categorizationCases = [
  ['Biriyani', 'Food'],
  ['Briyani', 'Food'],
  ['Dosa', 'Food'],
  ['Canteen', 'Food'],
  ['Tea', 'Food'],
  ['Restaurant', 'Food'],
  ['Swiggy', 'Food'],
  ['Zomato', 'Food'],
  ['Zudio', 'Shopping'],
  ['Amazon', 'Shopping'],
  ['Flipkart', 'Shopping'],
  ['DMart', 'Shopping'],
  ['Printout', 'Education'],
  ['Xerox', 'Education'],
  ['Hackathon', 'Education'],
  ['Stationery', 'Education'],
  ['Library', 'Education'],
  ['Uber', 'Transport'],
  ['Ola', 'Transport'],
  ['Metro', 'Transport'],
  ['Hospital', 'Healthcare'],
  ['Medical', 'Healthcare'],
  ['Netflix', 'Entertainment'],
  ['Movie', 'Entertainment'],
  ['Electricity Bill', 'Utilities'],
  ['Recharge', 'Utilities'],
  ['Unknown Merchant', 'Other'],
] as const;

for (const [merchant, expectedCategory] of categorizationCases) {
  const result = categorizeMerchantDeterministically({ merchant });
  assert.strictEqual(
    result.category,
    expectedCategory,
    `${merchant} categorized as ${result.category} instead of ${expectedCategory}`
  );
}

console.log('Categorization smoke test passed for normalization and merchant examples.');