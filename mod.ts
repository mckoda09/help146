import { Bot } from "grammy";
import { Mistral } from "https://esm.sh/@mistralai/mistralai@1.5.1";

export const bot = new Bot(Deno.env.get("BOT_TOKEN")!);
const mistral = new Mistral({
  apiKey: Deno.env.get("MISTRAL_KEY"),
});

bot.chatType("private").command("start", async (c) => {
  await c.reply("Привет 👋");
  await c.reply(
    "Я помогу узнать любую информацию о 146 школе.\nСлушаю твои вопросы!"
  );
});

bot.chatType("private").on("msg:text", async (c) => {
  await c.replyWithChatAction("typing");

  const result = await mistral.agents.complete({
    stream: false,
    agentId: Deno.env.get("MISTRAL_AGENT_ID")!,
    messages: [
      {
        role: "user",
        content: c.msg.text,
      },
    ],
  });

  if (result.choices) {
    await c.reply(result.choices[0].message.content?.toString() || "Ошибка.");
  } else {
    await c.reply("Ошибка!");
  }
});

bot.catch((e) => console.error(e.message));
