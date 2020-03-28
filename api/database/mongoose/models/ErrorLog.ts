import { Schema, model } from 'mongoose';
import UseragentSchema from './useragent';

const ErrorLogSchema = new Schema(
  Object.assign(UseragentSchema, {
    message: String,
    stack: String,
    date: { type: Date, default: Date.now }
  })
);

export default model('ErrorLog', ErrorLogSchema);
