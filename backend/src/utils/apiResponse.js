export class ApiResponse {
  constructor(statusCode, data, message = 'Success') {
    this.statusCode = statusCode;
    this.success = statusCode < 400;
    this.message = message;
    this.data = data;
  }
}

export const sendSuccess = (res, statusCode, data, message) => {
  return res.status(statusCode).json(new ApiResponse(statusCode, data, message));
};
