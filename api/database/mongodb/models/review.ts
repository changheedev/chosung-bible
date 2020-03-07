import mongoose from '../index';
import { Schema } from 'mongoose';

const ReviewSchema = new Schema({
  useragent: { type: Map, of: String },
  content: String,
  date: { type: Date, default: Date.now }
});

export default mongoose.model('Review', ReviewSchema);
