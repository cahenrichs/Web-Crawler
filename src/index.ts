import { getHTML } from "./crawl.js";

async function main() {
if (process.argv.length === 2) {
    process.exit(1)
} else  if (process.argv.length > 3) {
    process.exit(1)
}
const baseURL = process.argv[2];
console.log(`Crawler is starting at ${baseURL}`)
await getHTML(baseURL)
process.exit(0)


}

main();