import { test, expect, describe  } from "vitest"
import { normalizeURL } from "./crawl.js"

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