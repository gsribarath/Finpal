import mongoose, { Document, Schema } from 'mongoose';

export interface IMerchantCategoryRule extends Document {
  _id: mongoose.Types.ObjectId;
  merchant: string;
  normalizedMerchant: string;
  category: string;
  matchedKeyword?: string;
  matchedMerchant?: string;
  confidenceScore: number;
  source: 'manual' | 'seed' | 'learned';
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const merchantCategoryRuleSchema = new Schema<IMerchantCategoryRule>(
  {
    merchant: {
      type: String,
      required: true,
      trim: true,
    },
    normalizedMerchant: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      index: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    matchedKeyword: {
      type: String,
      trim: true,
    },
    matchedMerchant: {
      type: String,
      trim: true,
    },
    confidenceScore: {
      type: Number,
      required: true,
      min: 0,
      max: 1,
      default: 0.95,
    },
    source: {
      type: String,
      enum: ['manual', 'seed', 'learned'],
      default: 'manual',
    },
    active: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

merchantCategoryRuleSchema.index({ normalizedMerchant: 1, active: 1 });

export const MerchantCategoryRule = mongoose.model<IMerchantCategoryRule>(
  'MerchantCategoryRule',
  merchantCategoryRuleSchema
);

export default MerchantCategoryRule;