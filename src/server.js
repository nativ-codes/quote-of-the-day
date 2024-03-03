const express = require("express");
const fs = require("node:fs");
const path = require("path");
const quotes = require("./quotes.json");
const cors = require("cors");

const app = express();
const port = 3000;
const isDebugMode = false;

app.use(cors());
app.use(express.static("../public"));

const backgroundsPath = "../public/backgrounds";
const rawBackgroundsPath = "../public/raw-backgrounds";
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
			`${rawBackgroundsPath}/${getRandomString()}.${extension}`
		);
	});
});

app.get("/generate", (req, res) => {
	const day = "4 March 2024";
	const backgrounds = fs.readdirSync(backgroundsPath);
	const randomBackground = getRandomFromList(backgrounds);
	const randomQuote = getRandomFromList(quotes);
	const content = `${day}:${randomBackground}:${randomQuote.author}:${randomQuote.quote}\n`;

	fs.appendFile(
		`generated${isDebugMode ? ".debug" : ""}.txt`,
		content,
		(err) => {
			if (err) {
				console.error(err);
			} else {
				res.json({
					day,
					...randomQuote,
					imgUrl: `backgrounds/${randomBackground}`,
				});
			}
		}
	);
});

app.listen(port, () => {
	console.log(`Example app listening on port ${port}`);
});
