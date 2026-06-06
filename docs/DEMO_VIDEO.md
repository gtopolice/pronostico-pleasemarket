# Please.market — demo video script

**Tracks:** [Ethereum México — Startups](https://ethereumexico.notion.site/Ethereum-Mexico-Guide-Prizes-3576a580104b80d1992eddf2f2c9923f) · [Bitso — Startups](https://dorahacks.io/hackathon/ethmexico2026bitso/detail)  
**Hackathon hub:** [AI × Blockchain Hackathon](https://ethereumexico.notion.site/AI-x-Blockchain-Hackathon-3576a580104b8039a386da33e266e595)  
**Target length:** 2:30 – 3:00  
**Idioma:** Español (todo el video)  
**Live URLs:** [Web `/es`](https://pleasemarket-web-production.up.railway.app/es) · [Worker](https://pleasemarket-worker-production.up.railway.app)

---

## Elevator pitch (español — léelo al inicio o en cierre)

> **Anyone** (anyone.market) ya opera mercados de predicción en Base. **Please.market** es la capa en X: mencionas a **@PleaseMarketBot** con una pregunta de sí o no → la IA la convierte en mercado → tú resuelves, la gente apuesta.  
> Demo en **MXNB** (Bitso en Arbitrum), billeteras **Privy** sin gas, sin frase semilla. Startup mexicana para los tracks **Ethereum México** y **Bitso**.

---

## Concepto del video

**Empieza en X.** No en la homepage. El espectador ve tu perfil, el tweet al bot, y el bot te guía paso a paso hasta el mercado publicado.

Flujo que el video debe mostrar:

```
Tu perfil en X
  → Tweet con @PleaseMarketBot + pregunta
  → Bot responde (link de billetera o mercado listo)
  → /link-x → Privy + X → mercado creado
  → Página del mercado (/es/market/…)
  → Panel del creador (/es/dashboard)
  → Cierre: tracks + please.market
```

**Importante:** si tu cuenta de X **ya tiene billetera vinculada**, el bot salta directo al mercado (sin paso `/link-x`). Para mostrar el flujo completo, usa una cuenta X nueva o desvincula antes de grabar.

---

## Pre-grabación (15 min)

- [ ] **Bot activo:** `X_API_BEARER_TOKEN` + credenciales en Railway worker; menciones en vivo funcionando
- [ ] **Cuenta X:** la que aparecerá en pantalla — idealmente sin wallet vinculada (flujo completo)
- [ ] **Tweet preparado** (copiar/pegar al grabar):

  ```
  @PleaseMarketBot ¿Ganará un proyecto de pagos con MXNB el track startup de Bitso en ETH Mexico 2026?
  ```

- [ ] **Alternativa en inglés** (solo si grabas doble versión):

  ```
  @PleaseMarketBot Will a MXNB payments project win the Bitso startup track at ETH Mexico 2026?
  ```

- [ ] Navegador limpio; notificaciones off; zoom 100%
- [ ] Privy: si usas cuenta ya vinculada, ten sesión lista para el dashboard al final
- [ ] **Plan B** (si el bot no responde en vivo): curl en terminal — ver [fallback](#fallback-si-x-no-responde-en-vivo)

---

## Storyboard — X primero (~2:45)

| Tiempo | Escena | Pantalla |
|--------|--------|----------|
| 0:00–0:20 | Elevator pitch (VO) | Tu perfil en X (scroll suave) |
| 0:20–0:40 | Publicas el tweet | Composer → Post → timeline |
| 0:40–1:00 | Bot responde | Notificación / hilo con @PleaseMarketBot |
| 1:00–1:35 | Vincular billetera | Click enlace del bot → `/link-x` → Privy |
| 1:35–2:05 | Mercado publicado | Bot confirma en X **o** redirect a `/es/market/{id}` |
| 2:05–2:25 | Mercado + trade | Gráfica, MXNB, badge preview hackathon |
| 2:25–2:40 | Panel creador | `/es/dashboard` |
| 2:40–3:00 | Cierre tracks | VO + end card please.market · anyone.market · GitHub |

*Si tu wallet ya está vinculada: comprime 1:00–1:35 — el bot responde directo con el enlace al mercado (~15 s).*

---

## Script completo — Español

Lee con calma. **[Acciones]** = lo que haces en pantalla, no lo dices.

### 0:00 — Elevator pitch sobre tu perfil de X (20 s)

**[Pantalla: x.com/tu_usuario — timeline, sin grabar aún el tweet]**

> Somos **Pronóstico Labs**. Construimos **Anyone**, mercados de predicción en Base. Para **ETH Mexico × Bitso** lanzamos **Please.market**: un agente de IA en X que convierte un tweet en un mercado.  
> Sin frase semilla. Sin onboarding Web3. Demo en **MXNB** con **Privy** y **Bitso Business**. Les muestro el flujo completo desde mi cuenta de X.

### 0:20 — El tweet (20 s)

**[Abre composer en X; escribe o pega el tweet]**

> Crear un mercado es tan simple como mencionar al bot con una pregunta clara de sí o no.

**[Publica:]**

```
@PleaseMarketBot ¿Ganará un proyecto de pagos con MXNB el track startup de Bitso en ETH Mexico 2026?
```

> Publico la pregunta. Es meta pero intencional: estamos en el hackathon **ETH Mexico × Bitso**, compitiendo en el **track startup de pagos con MXNB** — y el mercado nace exactamente donde vive la conversación: en X.

> El agente — **Python, FastAPI, OpenAI** en structured JSON, sin LangChain — parsea la intención, modera, y orquesta el deploy.

### 0:40 — Respuesta del bot (20 s)

**[Espera notificación; abre el hilo / respuesta de @PleaseMarketBot]**

**Primera vez (sin wallet vinculada)** — el bot dice algo como:

> *Vincula tu billetera con el enlace de abajo para crear un mercado — impulsado por @Anyone_Market*  
> *[enlace please.market/link-x?token=…]*

> El bot me pide vincular billetera. Es un enlace de un solo uso, atado a **mi** cuenta de X — nadie más puede usarlo.

**Wallet ya vinculada** — el bot responde directo:

> *¡Tu mercado ya está en please.market!*  
> *¿Ganará un proyecto de pagos con MXNB el track startup de Bitso en ETH Mexico 2026?*  
> *[enlace /es/market/…]*

> Si ya vinculé antes, el mercado sale al instante. **[Salta a escena “Mercado publicado”]**

### 1:00 — Vincular billetera (35 s)

**[Click en el enlace del bot → please.market/link-x]**

> Entro al flujo de vinculación. Inicio sesión con **la misma cuenta de X** que publicó el tweet.

**[“Sign in with X” → Privy crea embedded wallet + smart wallet]**

> **Privy** crea la billetera embebida y la smart wallet en **Base Sepolia** — account abstraction, sin gas para el usuario.

**[Completa link — auto-redirect o “View your market”]**

> Al completar, el agente retoma el tweet pendiente y publica el mercado. No tuve que volver a X ni repetir la pregunta.

### 1:35 — Mercado publicado (30 s)

**[Vuelve a X brevemente: segunda respuesta del bot con enlace, **o** ya estás en `/es/market/{id}`]**

> El bot confirma en X con el enlace al mercado. **[Abre `/es/market/{id}`]**

> Aquí está el mercado: pregunta, reglas de resolución, cierre. El creador — yo — resuelve dentro de 48 horas después del cierre.

**[Scroll: gráfica, volumen, panel de trade en MXNB, badge “Preview hackathon · deploy onchain próximamente”]**

> Para el track de **Bitso**, el demo liquida en **MXNB** — stablecoin peso en **Arbitrum** vía Bitso Business. Flujo: **MXN → MXNB → operar**, billeteras inteligentes sin gas.

> Para el hackathon los mercados son **preview** en nuestra base; en producción conectan a los mismos contratos que **anyone.market** en Base.

### 2:05 — Panel del creador (20 s)

**[Navega a `/es/dashboard`]**

> Desde el panel veo mis mercados, ganancias demo, y puedo resolver o compartir. Todo ligado a la misma identidad: X + Privy.

### 2:25 — Cierre dual track (35 s)

**[Opcional: flash rápido de `/es` — strip hackathon ETH Mexico × Bitso — 3 s]**

> **Track startup Ethereum México:** startup mexicana llevando Ethereum al consumidor — agente IA, account abstraction, distribución donde la gente ya debate.

> **Track startup Bitso:** pagos locales con **MXNB**, on-ramp MXN, y un caso de uso real — mercados de predicción en X.

> Demo en vivo: **pleasemarket-web-production.up.railway.app**. Repo en GitHub. Gracias.

**[End card: please.market · anyone.market · @PleaseMarketBot · GitHub]**

---

## Textos del bot (referencia al grabar)

| Momento | Español |
|---------|---------|
| Pide wallet | Vincula tu billetera con el enlace de abajo para crear un mercado — impulsado por @Anyone_Market |
| Mercado listo | ¡Tu mercado ya está en please.market! + pregunta + URL |
| Rechazo | No puedo crear ese mercado: [razón] |

---

## Fallback si X no responde en vivo

Graba el tweet en X de todos modos; simula la respuesta del bot con curl en una ventana aparte (cortar en edición) o dispara el webhook manualmente con **tu `author_id` real** de X:

```bash
curl -sS -X POST https://pleasemarket-worker-production.up.railway.app/api/x/webhook \
  -H 'Content-Type: application/json' \
  -d '{
    "tweet_id": "TU_TWEET_ID",
    "author_id": "TU_TWITTER_ID",
    "author_handle": "tu_handle",
    "text": "@PleaseMarketBot ¿Ganará un proyecto de pagos con MXNB el track startup de Bitso en ETH Mexico 2026?"
  }'
```

Luego abre el enlace que el bot habría posteado (`/link-x?token=…` o `/es/market/{id}`).

---

## One-liners por si improvisas

**Ethereum México**

- “No es un repo de hackathon — **Anyone** ya opera; Please.market es la capa de distribución en X.”
- “IA que produce intents estructurados listos para on-chain, no chat genérico.”
- “Ethereum invisible: Privy AA, sin seed phrase.”

**Bitso**

- “**MXNB** hace que el mercado se sienta local — pesos, no solo USD DeFi.”
- “Bitso Business es el on-ramp; Privy quita el gas del UX.”
- “Base para protocolo, Arbitrum para MXNB — un producto, dos rails.”

---

## Post-producción

- **Título:** `Please.market — mercados de predicción desde X | ETH Mexico × Bitso 2026`
- **Descripción:** enlaces a web, GitHub, anyone.market, tracks
- **Miniatura:** screenshot del hilo X con @PleaseMarketBot + logo
- **Export:** 1080p MP4

---

## Submission

| Plataforma | Requiere |
|------------|----------|
| [DoraHacks BUIDL](https://dorahacks.io/hackathon/ethmexico2026bitso/detail) | GitHub público · video · tracks **Ethereum México startup** + **Bitso startup** |
| Skool / ETH Mexico | Mismo video |

Ver también: `docs/JUDGES.md` · `docs/HANDOFF.md`
