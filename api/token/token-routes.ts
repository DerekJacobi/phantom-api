import express from "express";
import { priceData } from "./mock-price-data.ts";

const tokenRoutes = express.Router();

export type TokenT = {
  perPage: number;
  page: number;
  total: number;
  totalWalletValue: number;
  records: TokenDataT[];
};

export type TokenDataT = {
  mintAddress: string;
  tokenAccountAddress: string;
  amount: string;
  type: string;
  name: string;
  symbol: string;
  imageUrl: string;
  totalValue: number;
  dailyPriceChangeInPercentage: number | null;
};

// refactor this to use the coingecko api and helper functions
const getPriceData = (tokenData: TokenT) => {
  tokenData.totalWalletValue = 0;

  const priceMap: {
    [key: string]: { usd: number; usd_24h_change: number | null };
  } = priceData[0];

  tokenData.records.forEach((token) => {
    if (token.symbol) {
      const symbol = token.symbol.toLowerCase();

      const currentTokenPrice = priceMap[symbol] ? priceMap[symbol].usd : 0;
      const totalAmountInWallet = token.amount;
      const quantity = Number(totalAmountInWallet);

      const totalValueInWallet = currentTokenPrice
        ? currentTokenPrice * quantity
        : 0;
      tokenData.totalWalletValue += totalValueInWallet;

      tokenData.records.find((currentToken, index) => {
        if (currentToken.symbol === token.symbol) {
          tokenData.records[index].totalValue = totalValueInWallet;
          tokenData.records[index].dailyPriceChangeInPercentage =
            priceMap[symbol]?.usd_24h_change;
        }
      });
    }
  });

  tokenData.records = tokenData.records.filter(
    (token) => token.type === "fungible" && token.amount !== "0"
  );

  return tokenData;
};

tokenRoutes.get("/", async (req, res) => {
  const { publicKey, page, perPage } = req.query;
  try {
    const response = await fetch(
      `https://api.phantom.app/token-data/?publicKey=${publicKey}&page=${page}&perPage=${perPage}`
    );
    const data = await response.json();
    const tokenDataWithPrice = getPriceData(data);

    // const allTokens = tokenDataWithPrice.records.map((token) => token.symbol);

    // const allTokensString = allTokens.join(",").toLowerCase();
    // const pricingData = await fetch(
    //   `https://api.coingecko.com/api/v3/simple/price?include_24hr_change=true&vs_currencies=usd&ids=${allTokensString}`
    // );
    // const pricingDataJson = await pricingData.json();

    res.send(JSON.stringify(tokenDataWithPrice));
  } catch (error) {
    res.status(500).send({ error: `Failed to get wallet data ${error}` });
  }
});

export default tokenRoutes;
