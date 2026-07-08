import { crawlPage } from "./crawl.js";

async function main() {
if (process.argv.length < 3) {
    process.exit(1)
} else  if (process.argv.length > 3) {
    console.log("Exiting")
    process.exit(1)
}
const baseURL = process.argv[2];
console.log(`Crawler is starting at ${baseURL}`)
const pages = await crawlPage(baseURL)
console.log(pages)
process.exit(0)


}

main();