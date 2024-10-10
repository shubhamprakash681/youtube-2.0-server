class APIResponse<T> {
  public statusCode: number;
  public data: T | undefined;
  public message: string;
  public success: boolean;

  constructor(statusCode: number, message: string, data?: T) {
    this.statusCode = statusCode;
    if (data) this.data = data;
    this.message = message;
    this.success = statusCode < 400;
  }
}

export default APIResponse;
