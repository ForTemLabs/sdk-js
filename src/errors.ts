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

/** Token expired/consumed error (403) */
export class FortemTokenExpiredError extends FortemError {
  constructor(message: string = "Access token expired or consumed") {
    super(message, 403, "TOKEN_EXPIRED");
    this.name = "FortemTokenExpiredError";
  }
}
