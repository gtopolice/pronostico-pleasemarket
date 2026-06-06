export default function HomePage() {
  return (
    <div>
      <h1>Please.market ▲</h1>
      <p className="card">
        Tag <strong>@PleaseMarketBot</strong> on X with a prediction-market prompt. Markets go live on{" "}
        <a href="https://please.market">please.market</a> (powered by{" "}
        <a href="https://anyone.market">Anyone</a>). You resolve; traders bet.
      </p>
      <p>
        <a className="btn" href="https://x.com/compose/tweet?text=@PleaseMarketBot%20">
          Open X
        </a>
      </p>
    </div>
  );
}
