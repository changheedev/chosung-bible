import { Schema, model } from 'mongoose';
import { UserAgent, UserAgentSchema } from './user-agent';

export interface SearchLog {
  userAgent: UserAgent;
  query: Object;
  date: number;
}

const SearchLogSchema = new Schema(
  Object.assign(UserAgentSchema, {
    query: { type: Map, of: String },
    date: Date
  })
);

export const SearchLogModel = model('SearchLog', SearchLogSchema);
