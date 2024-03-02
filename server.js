const express = require("express");
const fs = require("node:fs");
const quotes = require("./quotes.json");
var cors = require("cors");
const app = express();
const port = 3000;
const isDebugMode = true;

// #quotes #motivation #poetry #lifequotes #rulesoflife #inspirationalquotes #inspirational #dailyquote

app.use(cors());

const backgroundsPath = "./backgrounds";
const getRandomFromList = (list) =>
	list[Math.floor(Math.random() * list.length)];

app.get("/generate", (req, res) => {
	const backgrounds = fs.readdirSync(backgroundsPath);
	const randomBackground = getRandomFromList(backgrounds);
	const randomQuote = getRandomFromList(quotes);
	const content = `${randomBackground}:${randomQuote.author}:${randomQuote.quote}\n`;

	fs.appendFile(
		`generated${isDebugMode ? ".debug" : ""}.txt`,
		content,
		(err) => {
			if (err) {
				console.error(err);
			} else {
				res.json({
					...randomQuote,
					day: "2 March 2024",
					imgUrl: `${backgroundsPath}/${randomBackground}`,
				});
			}
		}
	);
});

app.listen(port, () => {
	console.log(`Example app listening on port ${port}`);
});
