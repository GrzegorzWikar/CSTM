export interface ApiFieldErrors {
  [fieldName: string]: string[];
}

export interface ProblemDetails {
  type: string | null;
  title: string | null;
  status: number | null;
  detail: string | null;
  instance: string | null;
}

export interface ValidationProblemDetails extends ProblemDetails {
  errors: ApiFieldErrors;
}

export interface ApiError {
  message: string;
  status: number | null;
  fieldErrors: ApiFieldErrors;
}