import { AppMessageCode, AppMessageDefinition } from "./types";

export const WarningDefinitions: Partial<
  Record<AppMessageCode, AppMessageDefinition>
> = {
  [AppMessageCode.PENDING_TRANSACTION]: {
    code: AppMessageCode.PENDING_TRANSACTION,
    severity: "warning",
    title: "messages.pendingTransaction.title",
    description: "messages.pendingTransaction.description",
    devMessage: "Transaction is currently pending in the blockchain",
    action: "unknown",
  },
};