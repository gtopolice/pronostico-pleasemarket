import type { Locale } from "@/lib/i18n/locales";

export type Messages = {
  meta: { title: string; description: string };
  nav: { leaderboard: string; dashboard: string; howItWorks: string };
  hackathon: {
    badge: string;
    title: string;
    subtitle: string;
    stackBase: string;
    stackPrivy: string;
    stackMxnb: string;
    stackAi: string;
    paymentsToday: string;
    paymentsNext: string;
  };
  home: {
    title: string;
    subtitleBefore: string;
    subtitleAfter: string;
    subtitleEnd: string;
    create: string;
    creatorDashboard: string;
    step1Title: string;
    step1Body: string;
    step2Title: string;
    step2Body: string;
    step3Title: string;
    step3Body: string;
    marketsTitle: string;
    marketsSubtitle: string;
    marketsLoading: string;
    marketsEmpty: string;
    composeTweet: string;
  };
  howItWorks: {
    title: string;
    gotIt: string;
    steps: Array<{ title: string; description: string }>;
  };
  market: {
    notFound: string;
    notFoundDetail: string;
    badgePreview: string;
    badgeHackathon: string;
    badgeLive: string;
    source: string;
    closes: string;
    creatorResolves: string;
    rulesFallback: string;
    untitled: string;
    tradeOnAnyone: string;
    hackathonPreview: string;
    createAnother: string;
    createdVia: string;
    onX: string;
    volume: string;
    previewTrade: string;
    amount: string;
    balance: string;
    buy: string;
    sell: string;
    yes: string;
    no: string;
    max: string;
    potentialWin: string;
    buyYes: string;
    buyNo: string;
    insufficientBalance: string;
  };
  dashboard: {
    title: string;
    subtitle: string;
    loading: string;
    walletMissing: string;
    signInPrompt: string;
    signIn: string;
    wallet: string;
    xAccount: string;
    xNotLinked: string;
    referral: string;
    referralHint: string;
    shareLink: string;
    resolveQueue: string;
    earnings: string;
    share: string;
    myMarkets: string;
    noMarkets: string;
    claimed: string;
  };
  leaderboard: {
    title: string;
    creatorSubtitle: string;
    ambassadorSubtitle: string;
    creators: string;
    ambassadors: string;
  };
  footer: {
    poweredBy: string;
  };
};

const en: Messages = {
  meta: {
    title: "please.market — prediction markets on X",
    description: "Create prediction markets by tagging @PleaseMarketBot on X",
  },
  nav: {
    leaderboard: "Leaderboard",
    dashboard: "Dashboard",
    howItWorks: "How it works",
  },
  hackathon: {
    badge: "ETH Mexico 2026 × Bitso Hackathon",
    title: "AI × blockchain × payments for LATAM",
    subtitle:
      "Create MXNB prediction markets from a tweet. Gasless Privy wallets — no seed phrase. Built in Mexico for Ethereum México & Bitso startup tracks.",
    stackBase: "Base",
    stackPrivy: "Privy AA",
    stackMxnb: "MXNB",
    stackAi: "OpenAI agent",
    paymentsToday: "Demo markets settled in MXNB on Arbitrum via Bitso Business.",
    paymentsNext: "On-ramp: MXN → MXNB → trade — gasless Privy smart wallets.",
  },
  home: {
    title: "Create prediction markets from X",
    subtitleBefore: "Tag",
    subtitleAfter:
      "with a yes/no question. AI turns it into a binary market — powered by",
    subtitleEnd: "You resolve; traders bet.",
    create: "Create",
    creatorDashboard: "Creator dashboard",
    step1Title: "Tag the bot",
    step1Body: "Mention @PleaseMarketBot with a clear yes/no prediction question.",
    step2Title: "Link your wallet",
    step2Body: "Use the reply link to connect Privy and verify your X account as creator.",
    step3Title: "Market goes live",
    step3Body: "Share the market page. Resolve within 48h after close; traders bet on anyone.market.",
    marketsTitle: "Markets from @PleaseMarketBot",
    marketsSubtitle: "Recent preview markets created on X.",
    marketsLoading: "Loading markets…",
    marketsEmpty: "No markets yet. Tag @PleaseMarketBot on X to create the first one.",
    composeTweet: "https://x.com/compose/tweet?text=@PleaseMarketBot%20",
  },
  howItWorks: {
    title: "How it works",
    gotIt: "Got it",
    steps: [
      {
        title: "1. Tag @PleaseMarketBot on X",
        description:
          "Tweet a yes/no question and mention @PleaseMarketBot. Our AI parses it into a binary prediction market.",
      },
      {
        title: "2. Link your wallet",
        description:
          "Reply with a one-time link. Sign in with Privy and connect the same X account so we know you are the creator.",
      },
      {
        title: "3. Market goes live",
        description:
          "Your market appears on please.market. You resolve within 48h after close; traders bet on anyone.market.",
      },
    ],
  },
  market: {
    notFound: "Market not found",
    notFoundDetail: "No market with id {id}.",
    badgePreview: "Preview",
    badgeHackathon: "Hackathon",
    badgeLive: "Live",
    source: "Source",
    closes: "Closes",
    creatorResolves: "Creator resolves within 48h after close",
    rulesFallback: "No resolution rules provided.",
    untitled: "Prediction market",
    tradeOnAnyone: "Trade on Anyone",
    hackathonPreview: "Hackathon preview · onchain deploy coming",
    createAnother: "Create another on X",
    createdVia: "Created via",
    onX: "on X.",
    volume: "Vol",
    previewTrade: "Hackathon preview · onchain deploy coming",
    amount: "Amount",
    balance: "Balance",
    buy: "Buy",
    sell: "Sell",
    yes: "Yes",
    no: "No",
    max: "Max",
    potentialWin: "Potential win",
    buyYes: "Buy Yes",
    buyNo: "Buy No",
    insufficientBalance: "Insufficient MXNB balance",
  },
  dashboard: {
    title: "Dashboard",
    subtitle: "Your creator profile and markets from @PleaseMarketBot.",
    loading: "Loading…",
    walletMissing: "Wallet not connected in this session. Sign in again with the same Privy account you used on /link-x.",
    signInPrompt: "Sign in to view your markets and referral link.",
    signIn: "Sign in with Privy",
    wallet: "Wallet",
    xAccount: "X",
    xNotLinked: "Not linked — create via @PleaseMarketBot first",
    referral: "Referral",
    referralHint: "Referral links attribute trades to you — you earn 10% of fees on those trades.",
    shareLink: "Create a share link",
    resolveQueue: "Resolve queue",
    earnings: "Earnings",
    share: "Share",
    myMarkets: "My markets",
    noMarkets: "No markets yet. Tag @PleaseMarketBot on X to create your first preview market.",
    claimed: "Claimed {amount} MXNB to your wallet.",
  },
  leaderboard: {
    title: "Leaderboard",
    creatorSubtitle: "Top creators by volume on Please.market preview markets.",
    ambassadorSubtitle: "Top ambassadors by attributed referral volume on Please.market preview markets.",
    creators: "Creators",
    ambassadors: "Ambassadors",
  },
  footer: {
    poweredBy: "powered by",
  },
} as const;

const es: Messages = {
  meta: {
    title: "please.market — mercados de predicción en X",
    description: "Crea mercados de predicción mencionando a @PleaseMarketBot en X",
  },
  nav: {
    leaderboard: "Ranking",
    dashboard: "Panel",
    howItWorks: "Cómo funciona",
  },
  hackathon: {
    badge: "Hackathon ETH Mexico 2026 × Bitso",
    title: "IA × blockchain × pagos para LATAM",
    subtitle:
      "Crea mercados de predicción en MXNB desde un tweet. Billeteras Privy sin gas — sin frase semilla. Hecho en México para los tracks startup de Ethereum México y Bitso.",
    stackBase: "Base",
    stackPrivy: "Privy AA",
    stackMxnb: "MXNB",
    stackAi: "Agente OpenAI",
    paymentsToday: "Demo: mercados liquidados en MXNB sobre Arbitrum vía Bitso Business.",
    paymentsNext: "On-ramp: MXN → MXNB → opera — billeteras inteligentes Privy sin gas.",
  },
  home: {
    title: "Crea mercados de predicción desde X",
    subtitleBefore: "Menciona a",
    subtitleAfter:
      "con una pregunta de sí/no. La IA la convierte en un mercado binario — impulsado por",
    subtitleEnd: "Tú resuelves; los traders apuestan.",
    create: "Crear",
    creatorDashboard: "Panel del creador",
    step1Title: "Menciona al bot",
    step1Body: "Menciona a @PleaseMarketBot con una pregunta clara de predicción sí/no.",
    step2Title: "Vincula tu billetera",
    step2Body: "Usa el enlace de respuesta para conectar Privy y verificar tu cuenta de X como creador.",
    step3Title: "El mercado queda en vivo",
    step3Body: "Comparte la página del mercado. Resuelve en 48 h después del cierre; los traders apuestan en anyone.market.",
    marketsTitle: "Mercados de @PleaseMarketBot",
    marketsSubtitle: "Mercados preview recientes creados en X.",
    marketsLoading: "Cargando mercados…",
    marketsEmpty: "Aún no hay mercados. Menciona a @PleaseMarketBot en X para crear el primero.",
    composeTweet:
      "https://x.com/compose/tweet?text=@PleaseMarketBot%20%C2%BFSe%20agotar%C3%A1%20ETH%20Mexico%20antes%20del%20domingo%3F%20",
  },
  howItWorks: {
    title: "Cómo funciona",
    gotIt: "Entendido",
    steps: [
      {
        title: "1. Menciona a @PleaseMarketBot en X",
        description:
          "Publica una pregunta de sí/no y menciona a @PleaseMarketBot. Nuestra IA la convierte en un mercado de predicción binario.",
      },
      {
        title: "2. Vincula tu billetera",
        description:
          "Responde con un enlace de un solo uso. Inicia sesión con Privy y conecta la misma cuenta de X para confirmar que eres el creador.",
      },
      {
        title: "3. El mercado queda en vivo",
        description:
          "Tu mercado aparece en please.market. Resuelves en 48 h después del cierre; los traders apuestan en anyone.market.",
      },
    ],
  },
  market: {
    notFound: "Mercado no encontrado",
    notFoundDetail: "No hay mercado con id {id}.",
    badgePreview: "Preview",
    badgeHackathon: "Hackathon",
    badgeLive: "En vivo",
    source: "Fuente",
    closes: "Cierra",
    creatorResolves: "El creador resuelve en 48 h después del cierre",
    rulesFallback: "No hay reglas de resolución.",
    untitled: "Mercado de predicción",
    tradeOnAnyone: "Operar en Anyone",
    hackathonPreview: "Preview hackathon · deploy onchain próximamente",
    createAnother: "Crear otro en X",
    createdVia: "Creado vía",
    onX: "en X.",
    volume: "Vol",
    previewTrade: "Preview hackathon · deploy onchain próximamente",
    amount: "Monto",
    balance: "Saldo",
    buy: "Comprar",
    sell: "Vender",
    yes: "Sí",
    no: "No",
    max: "Máx",
    potentialWin: "Ganancia potencial",
    buyYes: "Comprar Sí",
    buyNo: "Comprar No",
    insufficientBalance: "Saldo MXNB insuficiente",
  },
  dashboard: {
    title: "Panel",
    subtitle: "Tu perfil de creador y mercados de @PleaseMarketBot.",
    loading: "Cargando…",
    walletMissing:
      "Billetera no conectada en esta sesión. Inicia sesión de nuevo con la misma cuenta Privy que usaste en /link-x.",
    signInPrompt: "Inicia sesión para ver tus mercados y enlace de referido.",
    signIn: "Iniciar sesión con Privy",
    wallet: "Billetera",
    xAccount: "X",
    xNotLinked: "Sin vincular — crea uno vía @PleaseMarketBot primero",
    referral: "Referido",
    referralHint: "Los enlaces de referido atribuyen operaciones — ganas 10% de comisiones en esas operaciones.",
    shareLink: "Crear enlace para compartir",
    resolveQueue: "Cola de resolución",
    earnings: "Ganancias",
    share: "Compartir",
    myMarkets: "Mis mercados",
    noMarkets: "Aún no hay mercados. Menciona a @PleaseMarketBot en X para crear tu primer mercado preview.",
    claimed: "Reclamaste {amount} MXNB a tu billetera.",
  },
  leaderboard: {
    title: "Ranking",
    creatorSubtitle: "Mejores creadores por volumen en mercados preview de Please.market.",
    ambassadorSubtitle: "Mejores embajadores por volumen referido en mercados preview de Please.market.",
    creators: "Creadores",
    ambassadors: "Embajadores",
  },
  footer: {
    poweredBy: "impulsado por",
  },
};

export const MESSAGES: Record<Locale, Messages> = { en, es };

export function getMessages(locale: Locale): Messages {
  return MESSAGES[locale] ?? MESSAGES.en;
}
