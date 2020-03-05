import mongoose from '../index';
import { Schema } from 'mongoose';

const SearchLogSchema = new Schema({
  useragent: { type: Map, of: String },
  query: { type: Map, of: String },
  date: Date
});

export default mongoose.model('SearchLog', SearchLogSchema);
