import { InlineKeyboard, InlineQueryResultBuilder } from "./deps.ts";
import { notcoinKV } from "./types.ts";

const kv = await Deno.openKv();

type DateTimeFormatOptions = {
  year: "numeric";
  month: "short";
  day: "numeric";
  hour: "numeric";
  minute: "numeric";
  second: undefined;
  timeZoneName: "short";
};

const dateOptions: DateTimeFormatOptions = {
  year: "numeric",
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "numeric",
  second: undefined,
  timeZoneName: "short",
};

export const getNOT = async (ammount = 1, result?: "toUSD" | "toNOT") => {
  const notcoin = await kv.get<notcoinKV>(["notcoin", "current"]);

  let parsedAmmount = +ammount;

  if (isNaN(parsedAmmount)) {
    parsedAmmount = 1;
  }

  if (!notcoin.value) {
    return InlineQueryResultBuilder.article(
      "id:error",

      `USD͢/NOT`
    ).text(`error fetching the data`, {
      parse_mode: "HTML",
    });
  }

  let title = "NOT͢/USD";
  let description = `ㅤ\n${(parsedAmmount * notcoin.value.price).toFixed(
    5
  )} USD`;
  if (result === "toUSD") {
    title = "USD͢/NOT";
    description = `ㅤ\n${(parsedAmmount / notcoin.value.price).toFixed(5)} TON`;
  }

  if (!result) {
    return InlineQueryResultBuilder.article(
      "id:result",

      title,
      {
        description,
        thumbnail_url:
          "https://github.com/hojas-adrian/not-a-tracker/blob/main/assets/tracker.png?raw=true",
        reply_markup: new InlineKeyboard()
          .switchInline("to USD", "1 NOT")
          .switchInline("to NOT", "1 USD"),
      }
    ).text(output(notcoin.value, parsedAmmount, "toNOT"), {
      parse_mode: "HTML",
    });
  }

  return InlineQueryResultBuilder.article(
    "id:result",

    title,
    {
      description,
      thumbnail_url:
        "https://github.com/hojas-adrian/not-a-tracker/blob/main/assets/tracker.png?raw=true",
      reply_markup: new InlineKeyboard()
        .switchInline("to USD", "1 NOT")
        .switchInline("to NOT", "1 USD"),
    }
  ).text(output(notcoin.value, ammount, result), {
    parse_mode: "HTML",
  });
};

export const output = (
  notcoin: notcoinKV,
  ammount: number,
  action?: "toUSD" | "toNOT"
) => {
  const fecha = new Date(notcoin.last_update);
  const difer = notcoin.price - notcoin.oldPrice;

  let [label, price, currency] = ["", "", ""];
  if (action === "toUSD") {
    label = "USD to NOT";
    currency = `${ammount} USD`;
    price = `${(ammount / notcoin.price).toFixed(5)} NOT`;
  } else {
    label = "NOT to USD";
    currency = `${ammount} NOT`;
    price = `${(ammount * notcoin.price).toFixed(5)} USD`;
  }

  return `${label}\n<b>${currency} ⇆ ${price}</b>\n<pre>$${notcoin.price.toFixed(
    5
  )} | ${notcoin.price - notcoin.oldPrice >= 0 ? `▲` : "▼"}${(
    (Math.abs(difer) / notcoin.price) *
    100
  ).toFixed(2)}% (1h)\n<code>${fecha.toLocaleDateString(
    "en",
    dateOptions
  )}</code></pre>\nEarn now <a href="https://t.me/notcoin_bot?start=er_25443248">@notcoin_bot</a>`;
};
