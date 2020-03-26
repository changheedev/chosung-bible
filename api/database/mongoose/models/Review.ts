import { Schema, model } from 'mongoose';

const ReviewSchema = new Schema({
  useragent: { type: Map, of: String },
  content: String,
  date: { type: Date, default: Date.now }
});

export default model('Review', ReviewSchema);
