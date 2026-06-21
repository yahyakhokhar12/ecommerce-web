import { ApiError } from '../utils/apiError.js';

export const validate = (schema) => (req, res, next) => {
  try {
    const parsed = schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    req.body = parsed.body ?? req.body;
    req.query = parsed.query ?? req.query;
    req.params = parsed.params ?? req.params;
    next();
  } catch (error) {
    const errors = error.errors?.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));
    next(new ApiError(400, 'Validation failed', true, errors));
  }
};
