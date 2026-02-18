import { TOKEN_EXPIRED_STATUS } from "./constants";

/** ForTem API error */
export class FortemError extends Error {
    constructor(
        message: string,
        public readonly statusCode: number,
        public readonly code?: string,
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
        super(message, TOKEN_EXPIRED_STATUS, "TOKEN_EXPIRED");
        this.name = "FortemTokenExpiredError";
    }
}
