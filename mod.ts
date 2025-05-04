import { Bot, InlineKeyboard } from "grammy";
import { Mistral } from "https://esm.sh/@mistralai/mistralai@1.5.1";

export const bot = new Bot(Deno.env.get("BOT_TOKEN")!);
const mistral = new Mistral({
  apiKey: Deno.env.get("MISTRAL_KEY"),
});

const reportGroupId = -1002520608512;

bot.chatType("private").command("start", async (c) => {
  await c.reply("Привет 👋");
  await c.reply(
    "Я помогу узнать любую информацию о 146 школе.\nСлушаю твои вопросы.",
  );
});

bot.chatType("private").on("msg:text", async (c) => {
  if (c.msg.text.length > 300) {
    return await c.reply(
      "Слишком длинный запрос. Попробуйте описать проблему проще.",
    );
  }

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
    maxTokens: 300,
  });

  if (result.choices) {
    await c.reply(result.choices[0].message.content?.toString() || "Ошибка.", {
      reply_markup: new InlineKeyboard().text("Сообщить об ошибке", "report"),
      reply_parameters: {
        message_id: c.msg.message_id,
      },
    });
  } else {
    await c.reply("Ошибка!");
  }
});

bot.chatType("private").callbackQuery("report", async (c) => {
  await c.api.sendMessage(
    reportGroupId,
    `${c.from.id}, ${c.from.first_name} ${c.from.last_name} @${c.from.username}\n\n${c.msg?.reply_to_message?.text}\n\n${c.msg?.text}`,
  );
  await c.editMessageReplyMarkup({
    reply_markup: new InlineKeyboard().text("Отправлено!"),
  });
  await c.answerCallbackQuery();
});

bot
  .chatType("private")
  .callbackQuery(/.*/, async (c) => await c.answerCallbackQuery());

bot.catch((e) => console.error(e.message));
