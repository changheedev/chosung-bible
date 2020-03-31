import { Schema, model } from 'mongoose';
import { UserAgent, UserAgentSchema } from './user-agent';

export interface SearchLog {
  userAgent: UserAgent;
  query: Object;
  type: string;
  date: number;
}

const SearchLogSchema = new Schema(
  Object.assign(UserAgentSchema, {
    query: { type: Map, of: String },
    type: String,
    date: Date
  })
);

export const SearchLogModel = model('SearchLog', SearchLogSchema);
