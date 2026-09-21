import axios from 'axios';
import type {
  ApiError,
  ApiFieldErrors,
} from '../types';

const DEFAULT_ERROR_MESSAGE =
  'An unexpected error occurred. Please try again.';

function isObject(
  value: unknown,
): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function getStatusFromValue(
  value: unknown,
): number | null {
  if (typeof value === 'number') {
    return value;
  }

  if (typeof value === 'string') {
    const parsedValue = Number(value);

    return Number.isFinite(parsedValue)
      ? parsedValue
      : null;
  }

  return null;
}

function getFieldErrors(
  value: unknown,
): ApiFieldErrors {
  if (!isObject(value)) {
    return {};
  }

  const fieldErrors: ApiFieldErrors = {};

  for (const [fieldName, messages] of Object.entries(value)) {
    if (
      Array.isArray(messages) &&
      messages.every(
        (message) => typeof message === 'string',
      )
    ) {
      fieldErrors[fieldName] = messages;
    }
  }

  return fieldErrors;
}

function getMessageForStatus(
  status: number | null,
): string {
  switch (status) {
    case 400:
      return 'The request contains invalid data.';
    case 401:
      return 'Your session has expired. Please sign in again.';
    case 403:
      return 'You do not have permission to perform this action.';
    case 404:
      return 'The requested resource was not found.';
    case 409:
      return 'The request conflicts with the current resource state.';
    case 500:
      return 'The server encountered an error.';
    default:
      return DEFAULT_ERROR_MESSAGE;
  }
}

export function getApiError(error: unknown): ApiError {
  if (!axios.isAxiosError(error)) {
    if (error instanceof Error) {
      return {
        message: error.message,
        status: null,
        fieldErrors: {},
      };
    }

    return {
      message: DEFAULT_ERROR_MESSAGE,
      status: null,
      fieldErrors: {},
    };
  }

  const responseData: unknown = error.response?.data;
  const responseStatus = error.response?.status ?? null;

  if (!isObject(responseData)) {
    return {
      message: getMessageForStatus(responseStatus),
      status: responseStatus,
      fieldErrors: {},
    };
  }

  const problemStatus =
    getStatusFromValue(responseData.status) ??
    responseStatus;

  const detail =
    typeof responseData.detail === 'string'
      ? responseData.detail
      : null;

  const title =
    typeof responseData.title === 'string'
      ? responseData.title
      : null;

  return {
    message:
      detail ??
      title ??
      getMessageForStatus(problemStatus),
    status: problemStatus,
    fieldErrors: getFieldErrors(responseData.errors),
  };
}