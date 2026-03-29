// Injected into pages via chrome.scripting.executeScript({ files: ['content/extractor.js'] })
// Must be a self-contained script (no imports). Returns the extracted text as the last expression.
// The return value is available in the executeScript results array.

;(function extractPageContent(): string {
  const main =
    document.querySelector('main') ??
    document.querySelector('article') ??
    document.querySelector('[role="main"]')
  const source = main ?? document.body
  if (!source) return ''
  const text = (source as HTMLElement).innerText ?? ''
  return text.replace(/\s+/g, ' ').trim().slice(0, 3000)
})()
