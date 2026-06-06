/**
 * Contract error name → user-friendly Spanish message
 */
const CONTRACT_ERROR_MESSAGES: Record<string, string> = {
    "PoolAlreadyExists": "El pool para este mercado ya existe.",
    "PoolDoesNotExist": "El pool no existe.",
    "MarketAlreadyRegistered": "El mercado ya está registrado en el Hub.",
    "MarketNotRegistered": "El mercado no está registrado en el Hub.",
    "ConditionNotPrepared": "La condición no ha sido preparada en CTF.",
    "InsufficientUSDC": "Saldo insuficiente de USDC.",
    "SlippageExceeded": "El deslizamiento excedió el límite permitido.",
    "MarketClosed": "El mercado ya está cerrado para trading.",
    "NotAdmin": "No tienes permisos de administrador.",
    "NotOperator": "No tienes permisos de operador.",
    "InvalidAmount": "Cantidad inválida.",
    "LiquidityParameterTooLow": "El parámetro de liquidez (B) es demasiado bajo.",
    "PoolNotActive": "El pool no está activo.",
    "PoolAlreadyResolved": "El mercado ya ha sido resuelto.",
    "AlreadyResolved": "Ya ha sido resuelto.",
    "EscalationWindowNotOpen": "La ventana de escalado no está abierta.",
    "InvalidOutcomeCount": "Número de resultados inválido.",
    "NotPrimaryResolver": "No eres el resolutor primario.",
    "StrategyIsAdminOnly": "La estrategia es solo para admin.",
    "OnlyLiquidityProvider": "Solo el proveedor de liquidez puede ejecutar esta acción.",
};

/**
 * Common EVM error selectors (first 4 bytes of keccak256 signature)
 */
const ERROR_SELECTORS: Record<string, string> = {
    "0x0b5f6bf0": "MarketClosed",
    "0x8199f5f3": "SlippageExceeded",
    "0xfe7e4c35": "InsufficientUSDC",
    "0x71815202": "PoolNotActive",
    "0x9c8787c0": "PoolDoesNotExist",
    "0x1d5a9fa1": "MarketNotRegistered",
    "0x4323a555": "NotEnoughLiquidity",
};

/**
 * Walks a viem error chain looking for a ContractFunctionRevertedError
 * without importing viem (avoids module resolution issues in shared packages).
 */
function extractContractErrorName(error: any): string | null {
    // viem's BaseError has a `walk` method
    if (typeof error?.walk === "function") {
        const revertError = error.walk(
            (err: any) => err?.name === "ContractFunctionRevertedError"
        );
        if (revertError?.data?.errorName) {
            return revertError.data.errorName;
        }

        // Check for custom error data in simulation errors
        const executionError = error.walk(
            (err: any) => err?.name === "ExecutionRevertedError" || err?.name === "UserOperationRevertedError"
        );
        if (executionError?.data && typeof executionError.data === "string") {
            const selector = executionError.data.slice(0, 10).toLowerCase();
            if (ERROR_SELECTORS[selector]) return ERROR_SELECTORS[selector];
        }
    }

    // Fallback: try to find error name or hex selector in the message string
    const msg = (error?.message || error?.shortMessage || "").toLowerCase();

    // Check for hex selectors first
    for (const [selector, name] of Object.entries(ERROR_SELECTORS)) {
        if (msg.includes(selector.toLowerCase())) {
            return name;
        }
    }

    // Check for readable names
    for (const name of Object.keys(CONTRACT_ERROR_MESSAGES)) {
        if (msg.includes(name.toLowerCase())) {
            return name;
        }
    }

    return null;
}

/**
 * Converts a contract/wallet error into a clean, user-friendly Spanish message.
 * Works with viem errors without requiring viem as a dependency.
 */
export function getUserFriendlyError(error: any, fallbackMessage: string = "Ha ocurrido un error inesperado"): string {
    // 1. Try to extract a known contract error name
    const errorName = extractContractErrorName(error);
    if (errorName && CONTRACT_ERROR_MESSAGES[errorName]) {
        return CONTRACT_ERROR_MESSAGES[errorName];
    }
    if (errorName) {
        return `Error del contrato: ${errorName}`;
    }

    // 2. User rejected the transaction
    const msg = error?.message || error?.shortMessage || "";
    if (msg.includes("User rejected") || msg.includes("user rejected") || msg.includes("ACTION_REJECTED")) {
        return "Transacción cancelada por el usuario.";
    }

    // 3. Insufficient funds
    if (msg.includes("insufficient funds") || msg.includes("exceeds the balance")) {
        return "Fondos insuficientes para pagar el gas de la transacción.";
    }

    // 4. Use viem's shortMessage if available (one clean line)
    if (error?.shortMessage) {
        return error.shortMessage;
    }

    // 5. Generic fallback — trim to avoid showing hex dumps
    if (msg.length > 150) {
        return msg.substring(0, 150) + "…";
    }

    return msg || fallbackMessage;
}
