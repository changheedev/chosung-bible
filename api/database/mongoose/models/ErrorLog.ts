import { Schema, model } from 'mongoose';

const ErrorLogSchema = new Schema({
  useragent: { type: Map, of: String },
  message: String,
  stack: String,
  date: { type: Date, default: Date.now }
});

export default model('ErrorLog', ErrorLogSchema);
