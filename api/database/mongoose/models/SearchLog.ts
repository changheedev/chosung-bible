import { Schema, model } from 'mongoose';

const SearchLogSchema = new Schema({
  useragent: { type: Map, of: String },
  query: { type: Map, of: String },
  date: Date
});

export default model('SearchLog', SearchLogSchema);
