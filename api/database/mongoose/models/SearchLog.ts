import { Schema, model } from 'mongoose';
import UseragentSchema from './useragent';

const SearchLogSchema = new Schema(
  Object.assign(UseragentSchema, {
    query: { type: Map, of: String },
    date: Date
  })
);

export default model('SearchLog', SearchLogSchema);
