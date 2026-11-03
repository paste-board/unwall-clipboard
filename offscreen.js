chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg.target !== "offscreen" || msg.type !== "read-clipboard") return;
  const sink = document.getElementById("sink");
  sink.value = "";
  sink.focus();
  document.execCommand("paste");
  sendResponse(sink.value);
});
