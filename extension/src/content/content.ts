chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg?.type === "PAGE_SNAPSHOT") {
    const text = document.body?.innerText?.slice(0, 8000) ?? "";
    sendResponse({
      text,
      title: document.title,
      url: location.href,
    });
  }
  return true;
});
