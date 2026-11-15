export const COPY_SUCCESS = "Customer history message copied. You can now paste it into WhatsApp.";
export const COPY_FAILURE = "Unable to copy the message. Please select the preview and copy it manually.";

export type CopyNotifier = { success: (message: string) => void; error: (message: string) => void };
export type CopyEnvironment = {
  navigator?: { clipboard?: { writeText: (message: string) => Promise<void> } };
  document?: {
    createElement: (tag: string) => HTMLTextAreaElement;
    body: { appendChild: (node: HTMLTextAreaElement) => void };
    execCommand: (command: string) => boolean;
  };
};

function browserEnvironment(): CopyEnvironment {
  return {
    navigator: typeof navigator === "undefined" ? undefined : navigator,
    document: typeof document === "undefined" ? undefined : document,
  };
}

export async function copyForWhatsApp(message: string, notifier?: CopyNotifier, environment: CopyEnvironment = browserEnvironment()): Promise<boolean> {
  try {
    if (environment.navigator?.clipboard?.writeText) {
      await environment.navigator.clipboard.writeText(message);
    } else {
      const textarea = environment.document?.createElement("textarea");
      if (!textarea) throw new Error("Clipboard is unavailable");
      textarea.value = message;
      textarea.setAttribute("readonly", "");
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      environment.document?.body.appendChild(textarea);
      textarea.select();
      const copied = environment.document?.execCommand("copy");
      textarea.remove();
      if (!copied) throw new Error("Clipboard copy was rejected");
    }
    notifier?.success(COPY_SUCCESS);
    return true;
  } catch {
    notifier?.error(COPY_FAILURE);
    return false;
  }
}

export function whatsappUrl(message: string): string {
  return `https://wa.me/?text=${encodeURIComponent(message)}`;
}

export function shareOnWhatsApp(message: string): void {
  window.open(whatsappUrl(message), "_blank", "noopener,noreferrer");
}
