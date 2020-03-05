import mongoose from '../index';
import { Schema } from 'mongoose';

const ErrorLogSchema = new Schema({
  useragent: { type: Map, of: String },
  message: String,
  stack: String,
  date: { type: Date, default: Date.now }
});

export default mongoose.model('ErrorLog', ErrorLogSchema);
