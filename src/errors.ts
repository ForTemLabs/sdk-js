/** ForTem API error */
export class FortemError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly code?: string
  ) {
    super(message);
    this.name = "FortemError";
  }
}

/** Authentication error (401) */
export class FortemAuthError extends FortemError {
  constructor(message: string = "Authentication failed") {
    super(message, 401, "AUTH_ERROR");
    this.name = "FortemAuthError";
  }
}
