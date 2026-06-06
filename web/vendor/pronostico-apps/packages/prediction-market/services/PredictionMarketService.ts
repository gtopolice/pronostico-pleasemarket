import { ethers, Contract, Signer, Provider } from "ethers";
import {
  ERC20_ABI,
  FAUCET_ABI,
  CPMM_V3_ABI,
  CPMM_ROUTER_V3_ABI,
  CPMM_V4_ABI,
  CPMM_ROUTER_V4_ABI,
} from "../constants/abis";
import { Config, MarketData, UserFaucetInfo } from "../types";
import { contractsV3, contractsV4 } from "../constants/contracts";

export class PredictionMarketService {
  private provider: Provider;
  private signer?: Signer;
  private version: "V3" | "V4";

  constructor(
    provider?: Provider,
    signer?: Signer,
    version: "V3" | "V4" = "V4"
  ) {
    this.provider =
      provider || new ethers.JsonRpcProvider("https://sepolia.base.org");
    this.signer = signer;
    this.version = version;
  }

  get config(): Config {
    return this.version === "V3" ? contractsV3 : contractsV4;
  }

  // ── Version-aware helpers ──────────────────────────────────────────────────

  private getCpmmABI() {
    return this.version === "V4" ? CPMM_V4_ABI : CPMM_V3_ABI;
  }
  private getRouterABI() {
    return this.version === "V4" ? CPMM_ROUTER_V4_ABI : CPMM_ROUTER_V3_ABI;
  }

  private getCpmm(cpmmAddress: string): Contract {
    return new ethers.Contract(
      cpmmAddress,
      this.getCpmmABI(),
      this.signer || this.provider
    );
  }

  private getRouter(): Contract {
    return new ethers.Contract(
      this.config.routerAddr,
      this.getRouterABI(),
      this.signer || this.provider
    );
  }

  private get usdc(): Contract {
    return new ethers.Contract(
      contractsV3.usdcAddr,
      ERC20_ABI,
      this.signer || this.provider
    );
  }

  private get faucet(): Contract {
    if (!contractsV3.faucetAddr)
      throw new Error("Faucet address not configured");
    return new ethers.Contract(
      contractsV3.faucetAddr,
      FAUCET_ABI,
      this.signer || this.provider
    );
  }

  // ── Quote ─────────────────────────────────────────────────────────────────

  async getQuote(
    cpmmAddress: string,
    marketId: bigint,
    outcomeId: number,
    shares: bigint
  ): Promise<bigint> {
    const cpmm = this.getCpmm(cpmmAddress);
    if (this.version === "V4") {
      // V4: getTotalCost incluye fees (treasuryBps + 100), coincide con Router
      return await cpmm.getTotalCost(marketId, outcomeId, shares);
    }
    // V3: getCost sin fees (el ajuste lo hace el frontend)
    return await cpmm.getCost(marketId, outcomeId, shares);
  }

  // ── Buy Shares (version-aware) ─────────────────────────────────────────────

  async buyShares(
    cpmmAddress: string,
    marketId: bigint,
    outcomeId: number,
    shares: bigint,
    maxCost: bigint
  ) {
    if (!this.signer) throw new Error("Signer required");

    const usdcContract = this.usdc;
    const router = this.getRouter();
    const userAddress = await this.signer.getAddress();
    const cfg = this.config;

    const routerAllowance = await usdcContract.allowance(
      userAddress,
      cfg.routerAddr
    );
    if (routerAllowance < maxCost) {
      const txApprove = await usdcContract.approve(
        cfg.routerAddr,
        ethers.MaxUint256
      );
      await txApprove.wait();
    }

    if (this.version === "V4") {
      // V4v2: FeeOverride [treasuryFee, creatorFee, partnerFee, expiry, adminSig] + PartnerOverride struct
      const feeOverride = [0, 0, 0, 0, "0x"] as [
        number,
        number,
        number,
        number,
        string,
      ];
      const partnerOverride = {
        partner: ethers.ZeroAddress, // TODO: pasar partner real desde el backend
        partnerShare: 0, // 0 = usar default del mercado
        nonce: 0,
        expiry: 0,
        backendSig: "0x",
      };
      const tx = await router.buyShares(
        cpmmAddress,
        marketId,
        outcomeId,
        shares,
        feeOverride,
        partnerOverride,
        maxCost
      );
      return await tx.wait();
    } else {
      // V3: 7 params (with referrer at position 5)
      const feeOverride = [0, 0, 0, "0x"] as [number, number, number, string];
      const tx = await router.buyShares(
        cpmmAddress,
        marketId,
        outcomeId,
        shares,
        ethers.ZeroAddress,
        feeOverride,
        maxCost
      );
      return await tx.wait();
    }
  }

  // ── Encode Buy Shares (stateless calldata generation) ──────────────────────

  /**
   * Generates the calldata for a router.buyShares call without executing it.
   * Stateless — no signer required, no side effects, no allowance check.
   * Returns the target address and encoded data for use in batch transactions
   * (sendBatchTransaction for smart wallets, Multicall3.aggregate3 for EOAs).
   */
  encodeBuyShares(
    cpmmAddress: string,
    marketId: bigint,
    outcomeId: number,
    shares: bigint,
    maxCost: bigint
  ): { to: string; data: string } {
    const feeOverride = [0, 0, 0, 0, "0x"] as [
      number,
      number,
      number,
      number,
      string,
    ];
    const partnerOverride = {
      partner: ethers.ZeroAddress,
      partnerShare: 0,
      nonce: 0,
      expiry: 0,
      backendSig: "0x",
    };
    const iface = new ethers.Interface(this.getRouterABI());
    const data = iface.encodeFunctionData("buyShares", [
      cpmmAddress,
      marketId,
      outcomeId,
      shares,
      feeOverride,
      partnerOverride,
      maxCost,
    ]);
    return { to: this.config.routerAddr, data };
  }

  // ── Redeem ─────────────────────────────────────────────────────────────────

  async redeem(
    cpmmAddress: string,
    marketId: bigint,
    outcomeId: number,
    shares: bigint
  ) {
    if (!this.signer) throw new Error("Signer required");
    const cpmm = this.getCpmm(cpmmAddress);
    const tx = await cpmm.redeem(marketId, outcomeId, shares);
    return await tx.wait();
  }

  // ── V3 Redeem After Kill ──────────────────────────────────────────────────

  /**
   * V3: Redeem proportional refund after market has been killed.
   * Burns all user shares and returns invested amount + proportional fee refund.
   */
  async redeemAfterKillV3(cpmmAddress: string, marketId: bigint) {
    if (!this.signer) throw new Error("Signer required for redeemAfterKill");
    const cpmm = this.getCpmm(cpmmAddress);
    const tx = await cpmm.redeemAfterKill(marketId);
    return await tx.wait();
  }

  // ── V3 Claim Fees ─────────────────────────────────────────────────────────

  /**
   * V3: Claim accumulated creator/partner fees for a market.
   * Only callable by the market's creator or partner address.
   */
  async claimFeesV3(cpmmAddress: string, marketId: bigint) {
    if (!this.signer) throw new Error("Signer required for claimFees");
    const cpmm = this.getCpmm(cpmmAddress);
    const tx = await cpmm.claimFees(marketId);
    return await tx.wait();
  }

  // ── V4 Creator Fee Claims ─────────────────────────────────────────────────

  /**
   * V4: Obtiene el monto de comisiones de creador acumuladas para un mercado.
   * Función read-only (view), no requiere signer.
   */
  async getCreatorClaimableV4(
    cpmmAddress: string,
    marketId: bigint
  ): Promise<bigint> {
    const cpmm = new ethers.Contract(cpmmAddress, CPMM_V4_ABI, this.provider);
    return await cpmm.getCreatorClaimable(marketId);
  }

  /**
   * V4: Reclama las comisiones de creador acumuladas para un mercado.
   * Verifica que el caller (signer) sea el creador on-chain antes de enviar la tx.
   */
  async claimFeesV4(cpmmAddress: string, marketId: bigint) {
    if (!this.signer) throw new Error("Signer requerido para claimFeesV4");
    const cpmm = new ethers.Contract(cpmmAddress, CPMM_V4_ABI, this.signer);
    const creator = await cpmm.getCreator(marketId);
    const caller = await this.signer.getAddress();
    if (caller.toLowerCase() !== (creator as string).toLowerCase()) {
      throw new Error("Solo el creador del mercado puede reclamar comisiones");
    }
    const tx = await cpmm.claimFees(marketId);
    return await tx.wait();
  }

  // ── Utility Methods ───────────────────────────────────────────────────────

  async drip() {
    if (!this.signer) throw new Error("Signer required for faucet");
    const tx = await this.faucet.drip();
    return await tx.wait();
  }

  async getUserFaucetInfo(address: string): Promise<UserFaucetInfo> {
    const info = await this.faucet.getUserInfo(address);
    return {
      lastDrip: Number(info.lastDrip),
      canRequest: info.canRequest,
      timeUntilNext: Number(info.timeUntilNext),
      nextAmount: Number(info.nextAmount),
    };
  }

  async getFaucetBalance(): Promise<bigint> {
    return await this.faucet.getFaucetBalance();
  }

  async getUSDCBalance(address: string): Promise<bigint> {
    return await this.usdc.balanceOf(address);
  }

  async transferUSDC(to: string, amount: bigint) {
    if (!this.signer) throw new Error("Signer required for transfer");
    const tx = await this.usdc.transfer(to, amount);
    return await tx.wait();
  }

  async mintUSDC(amount: bigint) {
    if (!this.signer) throw new Error("Signer required for minting");
    const address = await this.signer.getAddress();
    const tx = await this.usdc.mint(address, amount);
    return await tx.wait();
  }
}
