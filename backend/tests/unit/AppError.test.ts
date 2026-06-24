import { AppError } from "@/utils/AppError";

describe("AppError", () => {
  it("sets statusCode and message", () => {
    const err = new AppError("Not found", 404);
    expect(err.message).toBe("Not found");
    expect(err.statusCode).toBe(404);
    expect(err.isOperational).toBe(true);
  });

  it("is an instance of Error", () => {
    expect(new AppError("oops", 500)).toBeInstanceOf(Error);
  });
});
