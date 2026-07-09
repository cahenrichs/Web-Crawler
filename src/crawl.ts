import { JSDOM } from "jsdom";
import { url } from "node:inspector";
import pLimit from "p-limit";

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

export class ConcurrentCrawler {
  baseURL: string;
  pages: Record<string, number>;
  limit: ReturnType<typeof pLimit>;

  constructor(baseURL: string, maxConcurrency: number) {
    this.baseURL = baseURL;
    this.pages = {};
    this.limit = pLimit(maxConcurrency);
  }
  private addPageVisit(normalizedURL: string): boolean {
    if (this.pages[normalizedURL]) {
      this.pages[normalizedURL]++;
      return false
    }
    this.pages[normalizedURL] = 1
    return true
  }
  private async getHTML(currentURL: string): Promise<string> {
    console.log(`crawling ${currentURL}`);
    return await this.limit(async () => {
      let res;
  try {
    res = await fetch(currentURL, {
      headers: { "User-Agent": "BootCrawler/1.0" },
    });
  } catch (err) {
    throw new Error(`Got Network error: ${(err as Error).message}`);
  }

  if (res.status > 399) {
    throw new Error(`Got HTTP error: ${res.status} ${res.statusText}`);
    
  }

  const contentType = res.headers.get("content-type");
  if (!contentType || !contentType.includes("text/html")) {
    throw new Error(`Got non-HTML response: ${contentType}`);
  }

  return res.text();
    })
  }

private async crawlPage(currentURL: string): Promise<void> {
  const baseURLObj = new URL(this.baseURL);
  const currentURLObj = new URL(currentURL);

  if (baseURLObj.hostname !== currentURLObj.hostname){
    return;
  }

  const normalizeCurrentURL = normalizeURL(currentURL)

  if (!this.addPageVisit(normalizeCurrentURL)) {
      return;
    }

  console.log(`crawling ${currentURL}`);

  let html = "";
    try {
      html = await this.getHTML(currentURL);
    } catch (err) {
      console.log(`${(err as Error).message}`);
      return;
    }

    const nextURLs = getURLsFromHTML(html, this.baseURL);

    const crawlPromises = nextURLs.map((nextURL) => this.crawlPage(nextURL));

    await Promise.all(crawlPromises);
  }

async crawl(): Promise<Record<string, number>> {
  await this.crawlPage(this.baseURL)
  return this.pages
}
}

export async function crawlSiteAsync(
  baseURL: string,
  maxConcurrency: number = 5,
): Promise<Record<string, number>> {
  const crawler = new ConcurrentCrawler(baseURL, maxConcurrency);
  return await crawler.crawl();
}

