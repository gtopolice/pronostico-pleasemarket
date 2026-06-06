import { AppError } from "@pronostico-apps/common";

export function formatTradeSubmitError(err: unknown): string {
  if (err instanceof AppError) {
    const detail = err.devMessage?.trim();
    if (detail) return detail;
    return err.message;
  }
  if (err instanceof Error) {
    const msg = err.message.trim();
    const lower = msg.toLowerCase();
    if (lower.includes("user rejected") || lower.includes("rejected")) {
      return "Transaction was rejected in wallet confirmation.";
    }
    return msg || "Trade failed.";
  }
  return "Trade failed.";
}
