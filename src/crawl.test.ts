import { test, expect, describe  } from "vitest"
import { getHeadingFromHTML, normalizeURL } from "./crawl.js"
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