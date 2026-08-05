export * from './use-outbox';

// Re-exported from the core so consumers can import everything from one place.
export { classifyHttpError } from '@enrouta/outbox';
export type {
  OutboxConfig,
  OutboxItem,
  OutboxResult,
  OutboxStorage,
  OutboxStatus,
  ErrorClass,
} from '@enrouta/outbox';
