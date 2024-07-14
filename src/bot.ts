import { startCron } from "../cron.ts";
import { Bot, InlineKeyboard, limit } from "./deps.ts";
import onErrorHandler from "./handlers/on_error_handler.ts";
import { notcoinKV } from "./types.ts";
import { getNOT, output } from "./utils.ts";

const BOT_TOKEN = Deno.env.get("BOT_TOKEN") as string;
const kv = await Deno.openKv();

export const bot = new Bot(BOT_TOKEN);
bot.use(limit());

startCron();

bot.inlineQuery(/\b\d+\s*usd\b/i, async (ctx) => {
  const number = ctx.inlineQuery.query.split(" ");

  const ammount = +number[0];
  if (isNaN(ammount)) {
    await ctx.answerInlineQuery([await getNOT(1)], {
      cache_time: 3600,
    });
  }

  await ctx.answerInlineQuery([await getNOT(ammount, "toUSD")], {
    cache_time: 3600,
  });
});

bot.inlineQuery(/\b\d+\s*not\b/i, async (ctx) => {
  const number = ctx.inlineQuery.query.split(" ");

  const ammount = +number[0];
  if (isNaN(ammount)) {
    await ctx.answerInlineQuery([await getNOT(1)], {
      cache_time: 3600,
    });
  }

  await ctx.answerInlineQuery([await getNOT(ammount, "toNOT")], {
    cache_time: 3600,
  });
});

bot.on(
  "inline_query",
  async (ctx) =>
    await ctx.answerInlineQuery([await getNOT(1)], {
      cache_time: 3600,
    })
);

bot.command("toNOT", async (ctx) => {
  const notcoin = await kv.get<notcoinKV>(["notcoin", "current"]);

  if (!notcoin.value) {
    return ctx.reply("error fetching the data");
  }

  const ammount = ctx.match.split(" ")[0];

  let parseAmmount = +ammount;

  if (isNaN(parseAmmount)) {
    parseAmmount = 1;
  }

  ctx.reply(output(notcoin.value, parseAmmount, "toUSD"), {
    parse_mode: "HTML",
  });
});

bot.command("toUSD", async (ctx) => {
  const notcoin = await kv.get<notcoinKV>(["notcoin", "current"]);

  if (!notcoin.value) {
    return ctx.reply("error fetching the data", {
      parse_mode: "HTML",
      reply_markup: new InlineKeyboard()
        .switchInline("to USD", "1 NOT")
        .switchInline("to NOT", "1 USD"),
    });
  }

  const ammount = ctx.match.split(" ")[0];

  let parseAmmount = +ammount;

  if (isNaN(parseAmmount)) {
    parseAmmount = 1;
  }

  ctx.reply(output(notcoin.value, parseAmmount, "toNOT"), {
    parse_mode: "HTML",
    reply_markup: new InlineKeyboard()
      .switchInline("to USD", "1 NOT")
      .switchInline("to NOT", "1 USD"),
  });
});

bot.catch(onErrorHandler);
