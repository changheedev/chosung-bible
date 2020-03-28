import { Schema, model } from 'mongoose';
import UseragentSchema from './useragent';

const ReviewSchema = new Schema(
  Object.assign(UseragentSchema, {
    content: String,
    date: { type: Date, default: Date.now }
  })
);

export default model('Review', ReviewSchema);
