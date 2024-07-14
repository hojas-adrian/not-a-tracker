import { notcoinKV } from "./src/types.ts";

export const startCron = async () => {
  const kv = await Deno.openKv();
  const COIN_BASE = Deno.env.get("COINBASE_API") as string;

  Deno.cron("Log a message", "0 * * * *", async () => {
    const url = "https://pro-api.coinmarketcap.com/v1/tools/price-conversion";

    const params = new URLSearchParams({
      amount: "1",
      symbol: "NOT",
      convert: "USD",
    });

    const getData = await fetch(`${url}?${params}`, {
      method: "GET",
      headers: {
        "X-CMC_PRO_API_KEY": COIN_BASE,
      },
    });

    const data = await getData.json();

    const notcoin: {
      id: number;
      symbol: "NOT";
      name: "Notcoin";
      amount: 1;
      last_updated: string;
      quote: {
        USD: {
          price: number;
          last_updated: string;
        };
      };
    } = data.data;

    const oldNotcoin = await kv.get<notcoinKV>(["notcoin", "current"]);

    let oldPrice = 0;

    if (oldNotcoin.value) {
      oldPrice = oldNotcoin.value?.price;
    }

    const update = {
      price: notcoin.quote.USD.price,
      last_update: notcoin.quote.USD.last_updated,
      oldPrice,
    };

    await kv.set(["notcoin", "current"], update);
  });
};
