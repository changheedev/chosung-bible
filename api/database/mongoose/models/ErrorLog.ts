import { Schema, model } from 'mongoose';
import { UserAgent, UserAgentSchema } from './user-agent';

export interface ErrorLog {
  userAgent: UserAgent;
  message: string;
  stack: string;
  date: number;
}

const ErrorLogSchema = new Schema(
  Object.assign(UserAgentSchema, {
    message: String,
    stack: String,
    date: { type: Date, default: Date.now }
  })
);

export const ErrorLogModel = model('ErrorLog', ErrorLogSchema);
