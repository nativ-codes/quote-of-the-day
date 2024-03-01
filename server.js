const express = require('express')
const fs = require('node:fs');
const app = express()
const port = 3000

const backgroundsPath = './backgrounds';
const getRandomFromList = list = list[Math.floor(Math.random() * list.length)];

app.get('/generate', (req, res) => {
	const backgrounds = fs.readdirSync(backgroundsPath);
	const randomBackground = getRandomFromList(backgrounds);
	const content = `Content - ${randomBackground}`;

	fs.appendFile('/generated.txt', content, err => {
		if (err) {
		  console.error(err);
		} else {
			res.json({
				imgUrl: randomBackground,
				quote: '',
				author: ''
			});
		}
	});
})

app.listen(port, () => {
	console.log(`Example app listening on port ${port}`)
})
