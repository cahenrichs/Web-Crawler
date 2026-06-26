import { test, expect, describe  } from "vitest"
import { getHeadingFromHTML, normalizeURL, getFirstParagraphFromHTML, getURLsFromHTML } from "./crawl.js"
import { JSDOM } from "jsdom"

describe("normalizeURL", () => {
    test("return the normalized version of the URL as a string", () => {
        const input = 'https://blog.boot.dev/path'
        const actual = normalizeURL(input)
        const expected = 'blog.boot.dev/path'
        expect(actual).toEqual(expected)
    })

    test('normalizeURL strip trailing slash', () => {
        const input = 'https://blog.boot.dev/path/'
        const actual = normalizeURL(input)
        const expected = 'blog.boot.dev/path'
        expect(actual).toEqual(expected)
    })

    test('normalizeURL capitals', () => {
        const input = 'HTTPS://BLOG.boot.dev/path'
        const actual = normalizeURL(input)
        const expected = 'blog.boot.dev/path'
        expect(actual).toEqual(expected)
    })
})

describe("getHeadingFromHTML", () => {
    test("returns the ext from the h1 tag", () => {
        const html = '<html><body><h1>Hello world</h1></body></html>'
        const result = getHeadingFromHTML(html)
        expect(result).toBe('Hello world')
    })

    test("trims extra whitespace from the heading text", () => {
        const html = '<html><body><h1>   My Heading   </h1></body></html>'
        const result = getHeadingFromHTML(html)
        expect(result).toBe('My Heading')
    })

    test('returns an empty string if there is no h1 tag', () => {
        const html = '<html><body><p>No heading here</p></body></html>'
        const result = getHeadingFromHTML(html)
        expect(result).toBe('')
    })

    test('returns an empty string for no html', () => {
        const html = ''
        const result = getHeadingFromHTML(html)
        expect(result).toBe('')
    })

    test('returns the text from an h2 tag if there is no h1 tag', () => {
        const html = '<html><body><h2>Subheading</h2></body></html>'
        const result = getHeadingFromHTML(html)
        expect(result).toBe('Subheading')
    })
})

describe("getFirstParagraphFromHTML", () => {
    test("main priority", () => {
        const inputbody = `
          <html><body>
            <p>Outside paragraph.</p>
            <main>
                <p>Main paragraph.</p>
                </main>
        </body></html>
`;
  const actual = getFirstParagraphFromHTML(inputbody);
  const expected = "Main paragraph.";
  expect(actual).toEqual(expected);
    })

    test("main p tag missing, so get first one", () => {
        const inputbody = `
          <html><body>
            <p>Outside paragraph.</p>
            <main>
                </main>
        </body></html>
`;
  const actual = getFirstParagraphFromHTML(inputbody);
  const expected = "Outside paragraph.";
  expect(actual).toEqual(expected);
    })

    test("No p tag", () => {
        const inputbody = `
          <html><body>
            <main>
                <h1>Main paragraph.</h1>
                </main>
        </body></html>
`;
  const actual = getFirstParagraphFromHTML(inputbody);
  const expected = "";
  expect(actual).toEqual(expected);
    })
})

describe("getURLsFromHTML", () => {
    test("absolute", () => {
      const inputURL = "https://crawler-test.com";
      const inputBody = `<html><body><a href="/path/one"><span>Boot.dev</span></a></body></html>`;

      const actual = getURLsFromHTML(inputBody, inputURL);
      const expected = ["https://crawler-test.com/path/one"];

      expect(actual).toEqual(expected);
    })

    test('finds all a tags in the HTML body', () => {
    const inputURL = 'https://crawler-test.com'
    const inputBody = `
      <html>
        <body>
          <a href="/path/one">One</a>
          <a href="/path/two">Two</a>
          <a href="https://crawler-test.com/path/three">Three</a>
        </body>
      </html>
    `

    const actual = getURLsFromHTML(inputBody, inputURL)
    const expected = [
      'https://crawler-test.com/path/one',
      'https://crawler-test.com/path/two',
      'https://crawler-test.com/path/three',
    ]

    expect(actual).toEqual(expected)
  })

  test('handles relative URLs without a leading slash', () => {
    const inputURL = 'https://crawler-test.com'
    const inputBody = `
      <html>
        <body>
          <a href="path/one">One</a>
        </body>
      </html>
    `

    const actual = getURLsFromHTML(inputBody, inputURL)
    const expected = ['https://crawler-test.com/path/one']

    expect(actual).toEqual(expected)
  })
})