import { JSDOM } from "jsdom";
import { url } from "node:inspector";

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

export function getImagesFromHTML(html: string, baseURL: string): string[] {
  const urls: string[] = []
  const dom = new JSDOM(html)
  const document = dom.window.document
  const main = document.querySelectorAll('img')

  for (const imgElement of main) {
    const src = imgElement.getAttribute("src")

    if (!src) {
      continue
    }

    const imageURL = new URL(src, baseURL)
    urls.push(imageURL.href)
  }

  return urls

}

export type ExtractedPageData = {
    url: string
    heading: string,
    first_paragraph: string,
    outgoing_links: string[],
    image_urls: string[],
}

export function extractPageData(html: string, pageUrl: string): ExtractedPageData {
  return {
    url: pageUrl,
    heading: getHeadingFromHTML(html),
    first_paragraph: getFirstParagraphFromHTML(html),
    outgoing_links: getURLsFromHTML(html, pageUrl), 
    image_urls: getImagesFromHTML(html, pageUrl)
  }
}

export async function getHTML(url:string) {
  try {
    const response = await fetch(url, {
      headers: {
        "USer-Agent": "BootCrawler/1.0"
      },
    });

    if (response.status >= 400) {
      console.error(`HTTP error: ${response.status} ${response.statusText}`);
      return;
    }

    const contentType = response.headers.get("content-type")
    if (!contentType || contentType !== "text/html") {
      console.error("Content Type not text/html")
    }

    const html = await response.text()
    console.log(html);
  } catch (error) {
    console.error("Failed to fetch HTML:", error)
  }

}