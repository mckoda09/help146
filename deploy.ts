import { webhookCallback } from "grammy";
import { bot } from "./mod.ts";

const handleUpdate = webhookCallback(bot, "std/http");

Deno.serve(async (req) => {
  try {
    return await handleUpdate(req);
  } catch (e) {
    console.error(e);
    return new Response(null, { status: 500 });
  }
});
