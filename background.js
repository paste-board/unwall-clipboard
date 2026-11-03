// https://example.com/a/b?x=1#y  ->  https://unwall.app/example.com/a/b?x=1#y
function toUnwall(raw) {
  let u;
  try {
    u = new URL((raw || "").trim());
  } catch {
    return null;
  }
  if (u.protocol !== "http:" && u.protocol !== "https:") return null;
  return "https://unwall.app/" + u.host + u.pathname + u.search + u.hash;
}

async function ensureOffscreen() {
  const existing = await chrome.runtime.getContexts({
    contextTypes: ["OFFSCREEN_DOCUMENT"],
  });
  if (existing.length) return;
  await chrome.offscreen.createDocument({
    url: "offscreen.html",
    reasons: ["CLIPBOARD"],
    justification: "Read the copied URL from the clipboard",
  });
}

async function flagError(title) {
  await chrome.action.setBadgeBackgroundColor({ color: "#b00020" });
  await chrome.action.setBadgeText({ text: "!" });
  await chrome.action.setTitle({ title });
}

async function clearError() {
  await chrome.action.setBadgeText({ text: "" });
  await chrome.action.setTitle({ title: "Open clipboard URL in Unwall" });
}

chrome.action.onClicked.addListener(async () => {
  await clearError();
  try {
    await ensureOffscreen();
    const text = await chrome.runtime.sendMessage({
      target: "offscreen",
      type: "read-clipboard",
    });
    const target = toUnwall(text);
    if (!target) {
      await flagError("Clipboard doesn't contain an http(s) URL");
      return;
    }
    await chrome.tabs.create({ url: target });
  } catch (e) {
    await flagError("Couldn't read the clipboard: " + e.message);
  }
});
