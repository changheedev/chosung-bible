import { Schema, model } from 'mongoose';
import { UserAgent, UserAgentSchema } from './user-agent';

export interface Review {
  userAgent: UserAgent;
  content: string;
  date: number;
}

const ReviewSchema = new Schema(
  Object.assign(UserAgentSchema, {
    content: String,
    date: { type: Date, default: Date.now }
  })
);

export const ReviewModel = model('Review', ReviewSchema);
