import { ApiError } from "./ApiError";

export const apiHandler = (handler: Function) => {
  return async (req: Request, context?: any) => {
    try {
      return await handler(req, context);
    } catch (error: any) {
      console.error("API Error:", error);
      throw new ApiError(
        error.statusCode || 500,
        error.message || "Server Error"
      );
    }
  };
};
