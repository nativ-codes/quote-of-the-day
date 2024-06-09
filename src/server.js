const express = require("express");
const fs = require("node:fs");
const path = require("path");
const quotes = require("./quotes.json");
const hashtags = require("./hashtags.json");
const cors = require("cors");

const app = express();
const port = 3000;
const isDebugMode = false;
const generatedQuotesFile = `./src/generated${isDebugMode ? ".debug" : ""}.txt`;

app.use(cors());
app.use(express.static("public"));

const backgroundsPath = "public/backgrounds";
const rawBackgroundsPath = "public/raw-backgrounds";
const getRandomString = () => (Math.random() + 1).toString(36).substring(2);
const getRandomFromList = (list) =>
	list[Math.floor(Math.random() * list.length)];

app.get("/", (req, res) => {
	res.sendFile(path.join(__dirname, "/index.html"));
});

app.get("/rename-raw", () => {
	const rawBackgrounds = fs.readdirSync(rawBackgroundsPath);
	rawBackgrounds.forEach((fileName) => {
		const extension = fileName.split(".").slice(-1)[0];
		fs.rename(
			`${rawBackgroundsPath}/${fileName}`,
			`${rawBackgroundsPath}/${getRandomString()}.${extension}`,
			() => {}
		);
	});
});

function getNewQuote(threshold = 50) {
	const backgrounds = fs.readdirSync(backgroundsPath);
	const generatedQuotesFileContent = fs.readFileSync(
		generatedQuotesFile,
		"UTF-8"
	);
	const generatedQuotesLines = generatedQuotesFileContent.split(/\r?\n/);

	let counter = 0;

	function tryGetUniqueQuote() {
		const randomBackground = getRandomFromList(backgrounds);
		const randomQuote = getRandomFromList(quotes);

		if (counter < threshold) {
			const isQuoteUnique = !generatedQuotesLines.some((line) => {
				const [date, picture, author, quote] = line.split("::");

				return (
					randomQuote.quote === quote || randomQuote.quote === picture
				);
			});

			if (isQuoteUnique) {
				return {
					...randomQuote,
					background: randomBackground,
				};
			} else {
				counter++;
				return tryGetUniqueQuote();
			}
		} else {
			throw "Unique quotes not found, try increasing the threshold.";
		}
	}

	return tryGetUniqueQuote();
}

function getHashtags(author) {
	const authorHashtag = `#${author.toLowerCase().split(" ").join("")}`;
	const newHashtags = [authorHashtag];

	while (newHashtags.length <= 7) {
		const newHashtag = getRandomFromList(hashtags);
		!newHashtags.includes(newHashtag) && newHashtags.push(newHashtag);
	}

	return newHashtags.join(" ");
}

app.get("/generate", (req, res) => {
	const day = "20 April 2024";
	const { background, author, quote } = getNewQuote();
	const content = `${day}::${background}::${author}::${quote}\n`;
	const hashtags = getHashtags(author);

	fs.appendFile(generatedQuotesFile, content, (err) => {
		if (err) {
			console.error(err);
		} else {
			res.json({
				day,
				quote,
				author,
				hashtags,
				imgUrl: `backgrounds/${background}`,
			});
		}
	});
});

app.listen(port, () => {
	console.log(`Example app listening on port ${port}`);
});
