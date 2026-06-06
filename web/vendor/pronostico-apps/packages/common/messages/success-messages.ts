import { AppMessageCode, AppMessageDefinition } from "./types";

export const SuccessDefinitions: Partial<
  Record<AppMessageCode, AppMessageDefinition>
> = {
  [AppMessageCode.SUCCESS_PREDICTION]: {
    code: AppMessageCode.SUCCESS_PREDICTION,
    severity: "success",
    title: "messages.successPrediction.title",
    description: "messages.successPrediction.description",
    devMessage: "Prediction was successful",
    action: "buy-tokens",
  },
  [AppMessageCode.SUCCESS_SALE]: {
    code: AppMessageCode.SUCCESS_SALE,
    severity: "success",
    title: "messages.successSale.title",
    description: "messages.successSale.description",
    devMessage: "User successfully sold tokens",
    action: "sell-tokens",
  },
  [AppMessageCode.SUCCESS_CLAIM]: {
    code: AppMessageCode.SUCCESS_CLAIM,
    severity: "success",
    title: "messages.successClaim.title",
    description: "messages.successClaim.description",
    devMessage: "User successfully claimed reward",
    action: "claim-reward",
  },
};
