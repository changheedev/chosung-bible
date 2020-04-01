import { Schema, model } from 'mongoose';
import { UserAgent, UserAgentSchema } from './user-agent';

export interface SearchLog {
  userAgent: UserAgent;
  query: string;
  type: string;
  date: number;
}

const SearchLogSchema = new Schema(
  Object.assign(UserAgentSchema, {
    query: String,
    type: String,
    date: Date
  })
);

export const SearchLogModel = model('SearchLog', SearchLogSchema);
