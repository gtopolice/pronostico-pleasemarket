# Prediction Market Web Library

Esta es una librería de TypeScript diseñada para integrar el protocolo de Pronóstico Market en aplicaciones Next.js/React. Está basada en la lógica probada del simulador del proyecto.

## Estructura

- `hooks/`: React hooks para manejar estado y balances.
- `services/`: Lógica central de comunicación con Smart Contracts (Ethers.js).
- `constants/`: ABIs de los contratos.
- `utils/`: Utilidades para formateo de BigInt y USDC.

## Ejemplo de Uso

```tsx
import { usePredictionMarket } from "@/lib/prediction-market";
import { ethers } from "ethers";

const config = {
  factoryAddr: "0x...",
  usdcAddr: "0xe34697D17c55F2c5c7954e9b9fC80f4F20fB6608",
  ctfAddr: "0x...",
  routerAddr: "0x...",
};

export function TradeComponent({ market }) {
  // browserProvider y signer obtenidos de wagmi, rainbowkit o ethers nativo
  const { balances, trade, loading } = usePredictionMarket(
    config,
    provider,
    signer
  );

  const handleBuy = async () => {
    const amount = ethers.parseUnits("100", 18);
    const limit = ethers.parseUnits("105", 6); // 105 USDC max cost
    await trade(market, true, amount, true, limit);
  };

  return (
    <div>
      <p>Saldo USDC: {balances.usdc}</p>
      <button onClick={handleBuy} disabled={loading}>
        {loading ? "Procesando..." : "Comprar YES"}
      </button>
    </div>
  );
}
```

## Características Soportadas

- **Trading Híbrido**: Compra y venta a través del `HybridRouterV2`.
- **Gestión de Liquidez**: Añadir y remover liquidez de pools LMSR.
- **Consultas de Estado**: Precios en tiempo real, inventario del pool y balances del usuario.
- **Resolución y Cobro**: Reportar resultados (Oracle) y reclamar ganancias.
