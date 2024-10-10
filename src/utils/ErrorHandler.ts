import statusCodes from "http-status-codes";

class ErrorHandler extends Error {
  public statusCode: number;
  public success: boolean;

  constructor(
    message: string = "Something went wrong",
    statusCode: number = statusCodes.INTERNAL_SERVER_ERROR,
    stack?: string
  ) {
    super(message);

    this.message = message;
    this.statusCode = statusCode;
    this.success = false;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export default ErrorHandler;
