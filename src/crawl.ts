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

export async function getHTML(url: string) {
  console.log(`crawling ${url}`);

  let res;
  try {
    res = await fetch(url, {
      headers: { "User-Agent": "BootCrawler/1.0" },
    });
  } catch (err) {
    throw new Error(`Got Network error: ${(err as Error).message}`);
  }

  if (res.status > 399) {
    console.log(`Got HTTP error: ${res.status} ${res.statusText}`);
    return;
  }

  const contentType = res.headers.get("content-type");
  if (!contentType || !contentType.includes("text/html")) {
    console.log(`Got non-HTML response: ${contentType}`);
    return;
  }

  return res.text();
}


export async function crawlPage(
  baseURL: string,
  currentURL: string = baseURL,
  pages: Record<string, number> = {},
) {
  const baseURLObj = new URL(baseURL);
  const currentURLObj = new URL(currentURL);

  if (baseURLObj.hostname !== currentURLObj.hostname){
    return pages
  }

  const normalizeCurrentURL = normalizeURL(currentURL)
  if (normalizeCurrentURL in pages) {
    pages[normalizeCurrentURL] += 1;
    return pages
  }
   pages[normalizeCurrentURL] = 1

  const html = await getHTML(currentURL)
  if (!html) {
    return pages
  }

  const urls = await getURLsFromHTML(html, currentURL)

  for (const url of urls) {
    pages = await crawlPage(baseURL, url, pages)
  }
  return pages
}
