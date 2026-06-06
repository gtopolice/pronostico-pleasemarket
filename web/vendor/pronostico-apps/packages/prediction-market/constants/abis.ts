import factoryAbi from "./factory_abi.json";
import hubAbi from "./hub_abi.json";
import ctfAbi from "./ctf_abi.json";

export { factoryAbi, hubAbi, ctfAbi };

export const ERC20_ABI = [
  "function mint(address to, uint256 amount)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function balanceOf(address) view returns (uint256)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function decimals() view returns (uint8)",
] as const;

export const FACTORY_ABI = factoryAbi as any;
export const CTF_ABI = ctfAbi as any;
export const HUB_ABI = hubAbi as any;

export const FAUCET_ABI = [
  "function drip() external",
  "function fund(uint256 amount) external",
  "function getFaucetBalance() external view returns (uint256)",
  "function canDrip(address user) external view returns (bool able, uint256 timeRemaining)",
  "function getUserInfo(address user) external view returns (uint256 lastDrip, bool canRequest, uint256 timeUntilNext, uint256 nextAmount)",
  "function getConfig() external view returns (uint256 _dripAmount, uint256 _cooldownPeriod, uint256 _faucetBalance)",
] as const;

export const HUB_ABI_CONTRACT = HUB_ABI;

// ── CPMM V3 ABIs (Legacy — singleton CPMM at exchangeAddr, with referrer) ──────

/**
 * Minimal ABI for CPMM V3 (legacy singleton).
 * buyShares has `referrer` param. `markets` is a public getter.
 * No claimFees, killMarket, or redeemAfterKill — these are V4 features.
 */
export const CPMM_V3_ABI = [
  // Creation (old 4-param)
  "function createMarket(uint8 outcomeCount, address oracle, (uint256 pMin,uint256 a,uint256 b,uint256 c,uint256 d) params, uint256 seedShares) external returns (uint256)",
  // Buying (LEGACY: includes referrer param)
  "function buyShares(uint256 marketId, uint8 outcomeId, uint256 amount, address recipient, address referrer, (uint16 treasuryFee,uint16 referrerFee,uint256 expiry,bytes adminSig) overrideParams) external returns (uint256 shares)",
  // Redeeming
  "function redeem(uint256 marketId, uint8 outcomeId, uint256 shares) external returns (uint256 payout)",
  // Pricing
  "function getCost(uint256 marketId, uint8 outcomeId, uint256 shares) external view returns (uint256 costUSDC)",
  "function getAmountOut(uint256 marketId, uint8 outcomeId, uint256 grossCostUSDC) external view returns (uint256 shares)",
  "function getMarketPrice(uint256 marketId, uint8 outcomeId) external view returns (uint256 price)",
  "function totalShares(uint256 marketId, uint8 outcomeId) external view returns (uint256)",
  "function outcomePools(uint256 marketId, uint8 outcomeId) external view returns (uint256)",
  "function sharesOf(uint256 marketId, address user, uint8 outcomeId) external view returns (uint256)",
  // Public getter (legacy — returns full struct)
  "function markets(uint256) external view returns (address oracle, bool resolved, bool paused, bool canceled, uint8 winningOutcome, uint8 outcomeCount, uint256 totalCollateral, (uint256 pMin,uint256 a,uint256 b,uint256 c,uint256 d) params)",
  "function treasury() external view returns (address)",
  "function collateralToken() external view returns (address)",
  // Events
  "event MarketResolved(uint256 indexed marketId, uint8 winningOutcome)",
] as const;

/**
 * Minimal ABI for CPMMRouter V3 (legacy).
 * buyShares has `referrer` param.
 */
export const CPMM_ROUTER_V3_ABI = [
  "function buyShares(address cpmm, uint256 marketId, uint8 outcomeId, uint256 amount, address referrer, (uint16 treasuryFee,uint16 referrerFee,uint256 expiry,bytes adminSig) overrideParams, uint256 maxCost) external returns (uint256 sharesOut)",
  "function getCost(address cpmm, uint256 marketId, uint8 outcomeId, uint256 shares) external view returns (uint256 cost)",
] as const;

/**
 * Minimal ABI for CPMMFactory V3 (legacy — onlyOwner deploy, no roles, no kill).
 */
export const CPMM_FACTORY_V3_ABI = [
  "function deployCPMM(string memory uri) external returns (address cpmm)",
  "function getCPMM(uint256 index) external view returns (address)",
  "function getCPMMCount() external view returns (uint256)",
] as const;

// ── CPMM V4 ABIs (Per-market CPMM, referrer removed, roles, kill, fee pool) ──────

/**
 * Minimal ABI for CPMM V4 (per-market instances).
 * BREAKING vs V3: referrer removed, FeeOverride at 5th param.
 * NEW vs V3: claimFees, killMarket, redeemAfterKill, individual getters.
 */
export const CPMM_V4_ABI = [
  // Initializer (called by CPMMDeployer when cloning the template)
  "function initialize(address _collateral, address _treasury, string _baseURI, address _factory) external",
  // Creation — (CreateMarketParams struct, checks factory.creators)
  "function createMarket((uint8,address,(uint256,uint256,uint256,uint256,uint256),uint256,address,address,uint16,uint16,uint16,uint256,uint256) params) external returns (uint256)",
  // Buying (V4v2: FeeOverride w/ creatorFee+partnerFee, +PartnerOverride)
  "function buyShares(uint256 marketId, uint8 outcomeId, uint256 amount, address recipient, (uint16 treasuryFee,uint16 creatorFee,uint16 partnerFee,uint256 expiry,bytes adminSig) overrideParams, (address partner,uint16 partnerShare,uint256 nonce,uint256 expiry,bytes backendSig) partnerOverride) external returns (uint256 shares)",
  // Redeeming
  "function redeem(uint256 marketId, uint8 outcomeId, uint256 shares) external returns (uint256 payout)",
  // Fee claiming (NEW in V4)
  "function claimFees(uint256 marketId) external",
  // Kill/refund (NEW in V4)
  "function killMarket(uint256 marketId) external",
  "function redeemAfterKill(uint256 marketId) external returns (uint256 refund)",
  // Resolution (oracle-only)
  "function resolveMarket(uint256 marketId, uint8 winningOutcomeId) external",
  // Pricing
  "function getAmountOut(uint256 marketId, uint8 outcomeId, uint256 grossCostUSDC) external view returns (uint256 shares)",
  "function getCost(uint256 marketId, uint8 outcomeId, uint256 shares) external view returns (uint256 costUSDC)",
  "function getTotalCost(uint256 marketId, uint8 outcomeId, uint256 shares) external view returns (uint256 costUSDC)",
  "function getMaxPurchase(uint256 marketId, uint8 outcomeId) external view returns (uint256 maxUSDC)",
  // Market info (individual getters — no public 'markets' mapping)
  "function getMarketPrice(uint256 marketId, uint8 outcomeId) external view returns (uint256 price)",
  "function totalShares(uint256 marketId, uint8 outcomeId) external view returns (uint256)",
  "function outcomePools(uint256 marketId, uint8 outcomeId) external view returns (uint256)",
  "function sharesOf(uint256 marketId, address user, uint8 outcomeId) external view returns (uint256)",
  "function getUserInvested(uint256 marketId, address user, uint8 outcomeId) external view returns (uint256)",
  "function getMarketStatus(uint256 marketId) external view returns (uint8)",
  "function getUserTotalInvested(uint256 marketId, address user) external view returns (uint256)",
  "function getTotalInvestedGlobal(uint256 marketId) external view returns (uint256)",
  "function getTotalCollateral(uint256 marketId) external view returns (uint256)",
  "function getOracle(uint256 marketId) external view returns (address)",
  "function getMarketState(uint256 marketId) external view returns (bool resolved, bool canceled, uint8 winningOutcome, uint8 outcomeCount)",
  "function isMarketPaused(uint256 marketId) external view returns (bool)",
  // Market metadata getters
  "function getCreator(uint256 marketId) external view returns (address)",
  "function getPartner(uint256 marketId) external view returns (address)",
  "function getCreatorShareBps(uint256 marketId) external view returns (uint16)",
  "function getPartnerShareBps(uint256 marketId) external view returns (uint16)",
  "function getTreasuryBps(uint256 marketId) external view returns (uint16)",
  "function getCreatorClaimable(uint256 marketId) external view returns (uint256)",
  "function getPartnerClaimable(uint256 marketId) external view returns (uint256)",
  "function getFeePoolAtKill(uint256 marketId) external view returns (uint256)",
  "function getTotalInvestedAtKill(uint256 marketId) external view returns (uint256)",
  "function getCloseTime(uint256 marketId) external view returns (uint256)",
  "function getEndTime(uint256 marketId) external view returns (uint256)",
  // Global state
  "function treasury() external view returns (address)",
  "function collateralToken() external view returns (address)",
  "function factory() external view returns (address)",
  "function owner() external view returns (address)",
  "function marketCount() external view returns (uint256)",
  // Events
  "event MarketCreated(uint256 indexed marketId, address indexed oracle, uint8 outcomeCount)",
  "event MarketResolved(uint256 indexed marketId, uint8 winningOutcome)",
  "event MarketCanceled(uint256 indexed marketId)",
  "event MarketKilled(uint256 indexed marketId)",
  "event SharesBought(uint256 indexed marketId, uint8 indexed outcomeId, address indexed buyer, uint256 amount, uint256 netDeposit)",
  "event Redeemed(uint256 indexed marketId, uint8 indexed outcomeId, address indexed redeemer, uint256 shares, uint256 reward)",
] as const;

/**
 * Minimal ABI for CPMMRouter V4v2.
 * BREAKING vs V4: FeeOverride has creatorFee+partnerFee, added PartnerOverride struct.
 */
export const CPMM_ROUTER_V4_ABI = [
  "function buyShares(address cpmm, uint256 marketId, uint8 outcomeId, uint256 amount, (uint16 treasuryFee,uint16 creatorFee,uint16 partnerFee,uint256 expiry,bytes adminSig) overrideParams, (address partner,uint16 partnerShare,uint256 nonce,uint256 expiry,bytes backendSig) partnerOverride, uint256 maxCost) external returns (uint256 sharesOut)",
  "function getCost(address cpmm, uint256 marketId, uint8 outcomeId, uint256 shares) external view returns (uint256 cost)",
] as const;

/**
 * Minimal ABI for CPMMFactory V4 (roles, permissionless creation, kill).
 */
/**
 * Minimal ABI for CPMMFactory V4v2 (roles, permissionless creation, kill + partner/fee override signers).
 */
export const CPMM_FACTORY_V4_ABI = [
  "function creators(address) external view returns (bool)",
  "function killers(address) external view returns (bool)",
  "function partnerSigners(address) external view returns (bool)",
  "function feeOverrideSigners(address) external view returns (bool)",
  "function isPaused() external view returns (bool)",
  "function paused() external view returns (bool)",
  "function addCreator(address) external",
  "function removeCreator(address) external",
  "function addKiller(address) external",
  "function removeKiller(address) external",
  "function addPartnerSigner(address) external",
  "function removePartnerSigner(address) external",
  "function addFeeOverrideSigner(address) external",
  "function removeFeeOverrideSigner(address) external",
  "function togglePause() external",
  "function registerCPMM(address) external",
  "function isCPMM(address) external view returns (bool)",
  "function getCPMMCount() external view returns (uint256)",
  "function allCPMMs(uint256) external view returns (address)",
  "function kill(address cpmm, uint256 marketId, uint256 salt, uint256 deadline, bytes calldata sig) external",
  // V2 — role-gated proxy functions
  "function createMarket(address cpmm, uint8 outcomeCount, address oracle, (uint256 pMin,uint256 a,uint256 b,uint256 c,uint256 d) curveParams, uint256 seedShares, address creator_, address partner_, uint16 creatorShareBps_, uint16 partnerShareBps_, uint16 treasuryBps_, uint256 closeTime_, uint256 endTime_, uint256 salt, uint256 deadline, bytes sig) external returns (uint256)",
  "function pauseMarket(address cpmm, uint256 marketId, bool paused) external",
  "function cancelMarket(address cpmm, uint256 marketId) external",
  // Events
  "event CPMMDeployed(address indexed cpmm, address collateral, address indexed treasury)",
  "event CreatorAdded(address indexed creator)",
  "event CreatorRemoved(address indexed creator)",
  "event KillerAdded(address indexed killer)",
  "event KillerRemoved(address indexed killer)",
  "event PauseToggled(bool paused)",
] as const;

/**
 * Minimal ABI for CPMMDeployer V4.
 * Clones the CPMM template and initializes it in a single deploy() call.
 * EIP-712 signature: Deploy(address c,uint256 s,uint256 d)
 * Domain: name="D", version="4"
 * The signer must be registered as a creator in the CPMMFactory.
 */
export const CPMM_DEPLOYER_V4_ABI = [
  "function deploy(address col, uint256 sa, uint256 dl, bytes sig) external returns (address cpmmAddr)",
  "function template() external view returns (address)",
  "function factory() external view returns (address)",
  "function treasury() external view returns (address)",
  "event Deployed(address indexed cpmm, address indexed creator)",
] as const;

/**
 * Minimal ABI for PronosticoResolutionHubV2 (V3 Hub).
 */
export const HUB_V3_ABI = [
  "function registerMarket(address cpmm, uint256 marketId, address oracle, uint256 closeTime, uint256 outcomeCount) external",
  "function resolveViaAdmin(address cpmm, uint256 marketId, uint8 winningOutcome) external",
] as const;

/**
 * Minimal ABI for CurveMathValidator
 */
export const CURVE_VALIDATOR_ABI = [
  "function simulateCost(uint256 currentShares, uint256 sharesToBuy, uint256 pMin, uint256 a, uint256 b, uint256 c, uint256 d) external pure returns (uint256 cost)",
  "function simulatePrice(uint256 x, uint256 pMin, uint256 a, uint256 b, uint256 c, uint256 d) external pure returns (uint256 price)",
] as const;

export const MULTICALL3_ABI = [
  "function aggregate3((address target, bool allowFailure, bytes callData)[] calldata calls) external payable returns ((bool success, bytes returnData)[] memory)",
] as const;
