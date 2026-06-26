import { JSDOM } from "jsdom";

export function normalizeURL(url: string) {
  const urlObj = new URL(url);
  let fullPath = `${urlObj.host}${urlObj.pathname}`;
  if (fullPath.slice(-1) === "/") {
    fullPath = fullPath.slice(0, -1);
  }
  return fullPath;
}

export function getHeadingFromHTML(html: string): string {
    const dom = new JSDOM(html)
    const document = dom.window.document
    const heading = document.querySelector('h1') || document.querySelector('h2')
    return heading?.textContent?.trim() || ''
}

export function getFirstParagraphFromHTML(html: string): string {
    const dom = new JSDOM(html)
    const document = dom.window.document
    const main = document.querySelector('main')

    const paragraph = main?.querySelector('p') || document.querySelector('p')

    return paragraph?.textContent?.trim() || ''
}

export function getURLsFromHTML(html: string, baseURL: string): string[] {
  const urls: string[] = []
    const dom = new JSDOM(html)
    const document = dom.window.document
    const main = document.querySelectorAll('a')

    for (const anchorElement of main) {
      const href = anchorElement.getAttribute("href")

      if (!href) {
        continue
      }

      const url = new URL(href, baseURL)
      urls.push(url.href)
    }
  return urls
}