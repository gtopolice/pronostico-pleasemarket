import { Config } from "../types";

/** V3 is the legacy singleton CPMM. V4 is the per-market CPMM with factory, roles, kill, and fee pool. */
export const contractsV3: Config = {
  factoryAddr: "0x232e53cC23AEEC8C72420E80FFdA66a7D12EBaeA", // CPMMFactory (legacy — only deployCPMM)
  usdcAddr: "0x7bae213CF8Fe2fCb700481d38A520EB41EDFcBE7",
  ctfAddr: "0xC171084e673cfD53Af70EDA8B37fe3082Df4d343",
  routerAddr: "0x5bED6e1c3D15d9af512F76348eaa1f726e4C2513", // CPMMRouter (legacy — with referrer)
  exchangeAddr: "0xDae72fBD6ad44143AB931481c4614b91A2dfD936", // CPMM singleton (market #1)
  resolutionHub: "0x026b67dC071179A3c4F6c867b168B964D9156bD4",
  umaResolver: "0x372339b37799a42a910eA6efF7F7cC75b7944A9c",
  faucetAddr: "0xd23b0E459f656D61f65eA2949fF4347fc411b4a6",
  validatorAddr: "0x6e0a4dd0ef8d852affe5b86ba2823ef834759f1a",
};

/**
 * V4 TEMPLATE UPGRADE (cpmm-fee-guards-and-solvency) — Deployed 2026-05-15
 *
 * Security fixes applied to CPMM.sol:
 * 1. `require(m.resolved, "Market not resolved")` in claimFees()
 * 2. Partner fees accumulated via m.partnerClaimable (not sent immediately)
 * 3. `require(!m.killed, "Market killed")` in resolveMarket()
 * 4. `nonReentrant` modifier on claimFees()
 *
 * A new CPMM template was deployed via DeployV4TemplateUpgrade.s.sol.
 * A new CPMMDeployer points to the new template; deployerAddr below updated.
 * Factory, Router, Hub remain unchanged.
 *
 * Existing V4 markets (created before this upgrade) continue using the OLD
 * template code. Only NEW markets deployed via the new deployer will include
 * these security fixes.
 *
 * New template address: 0x1fcb2f1c9292e06b69c00f448397585081438365
 * Deploy tx: (see deployment-cpmm-v4-v3.json)
 */
export const contractsV4: Config = {
  factoryAddr: "0x9a2d4872Dd1381Ee700d19Aab1Be4Fbf1801cD33", // CPMMFactory V4v2 (unchanged)
  usdcAddr: "0x7bae213CF8Fe2fCb700481d38A520EB41EDFcBE7",
  ctfAddr: "0xC171084e673cfD53Af70EDA8B37fe3082Df4d343",
  routerAddr: "0xED99bF27a7a0AC28E4a6eBc7192c7C3536C089e5", // CPMMRouter V4v2 (unchanged)
  exchangeAddr: "0x0000000000000000000000000000000000000000", // V4: no singleton
  deployerAddr: "0x46c1aa329e96691c3cf555537d41fbd1395ed4fb", // CPMMDeployer V4v3 (security fixes)
  resolutionHub: "0x6464027F29D011BbE703c431D34A7cBf0a46D66c", // Hub V2 (unchanged)
  umaResolver: "0x372339b37799a42a910eA6efF7F7cC75b7944A9c",
  faucetAddr: "0xd23b0E459f656D61f65eA2949fF4347fc411b4a6",
  validatorAddr: "0x6e0a4dd0ef8d852affe5b86ba2823ef834759f1a",
  multicall3Addr: "0xcA11bde05977b3631167028862bE2a173976CA11",
};
