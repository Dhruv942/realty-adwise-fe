import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { COPY_FAILURE, COPY_SUCCESS, copyForWhatsApp, whatsappUrl } from "../lib/whatsapp.ts";

const message = "Customer: Asha\nPrevious enquiries: None recorded";

describe("WhatsApp notification helpers", () => {
  it("copies through the Clipboard API and reports the exact success message", async () => {
    let copied = "";
    const notices: string[] = [];
    const result = await copyForWhatsApp(message, { success: (text) => notices.push(text), error: () => notices.push("error") }, {
      navigator: { clipboard: { writeText: async (text) => { copied = text; } } },
    });
    assert.equal(result, true);
    assert.equal(copied, message);
    assert.deepEqual(notices, [COPY_SUCCESS]);
  });

  it("falls back to a textarea when Clipboard API is unavailable", async () => {
    let value = "";
    let removed = false;
    const textarea = {
      value: "",
      style: {} as CSSStyleDeclaration,
      setAttribute: () => undefined,
      select: () => { value = textarea.value; },
      remove: () => { removed = true; },
    } as unknown as HTMLTextAreaElement;
    const result = await copyForWhatsApp(message, undefined, {
      document: {
        createElement: () => textarea,
        body: { appendChild: () => undefined },
        execCommand: () => true,
      },
    });
    assert.equal(result, true);
    assert.equal(value, message);
    assert.equal(removed, true);
  });

  it("reports clipboard failure and encodes WhatsApp line breaks", async () => {
    const notices: string[] = [];
    const result = await copyForWhatsApp(message, { success: () => notices.push("success"), error: (text) => notices.push(text) }, {
      navigator: { clipboard: { writeText: async () => { throw new Error("denied"); } } },
    });
    assert.equal(result, false);
    assert.deepEqual(notices, [COPY_FAILURE]);
    assert.equal(whatsappUrl(message), `https://wa.me/?text=${encodeURIComponent(message)}`);
  });
});
