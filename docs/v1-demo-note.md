# Capitol Gains V1 Demo Note

Capitol Gains V1 is a private portfolio demo for an x402-paid data API.

Demo path:

1. Open `https://capitolgains.xyz`.
2. Review the landing page and `/docs`.
3. Inspect `https://capitolgains.xyz/.well-known/x402.json` for machine-readable payment discovery.
4. Inspect `https://capitolgains.xyz/llms.txt` for agent-readable usage notes.
5. Run the standalone client:

   ```bash
   npm run x402:trades
   ```

Expected proof:

- The client receives an initial HTTP `402`.
- The client pays with USDC on Base Sepolia.
- The retry returns HTTP `200` with normalized John Fetterman trade data.
- A repeat paid request returns `metadata.cache_hit: true` with the same `metadata.as_of`.

Current V1 scope:

- Endpoint: `GET https://capitolgains.xyz/v1/trades`
- Members: `Gary Peters`, `John Fetterman`
- Price: `$0.05` USDC per call
- Network: Base Sepolia testnet

Notes:

- This is not investment advice.
- Data is sourced from FMP and public U.S. Senate disclosures.
- V1 remains a private portfolio demo, not a public launch.
