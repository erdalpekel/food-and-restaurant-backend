var dotenv = require("dotenv");
const result = dotenv.config();

if (result.error) {
	throw result.error;
}

console.log(result.parsed);

// mongoDB configuration
const mongoURI =
	"mongodb://" +
	result.parsed.DB_USER +
	":" +
	result.parsed.DB_PASS +
	"@" +
	result.parsed.DB_HOST +
	"/" +
	result.parsed.DB_NAME;

module.exports = {
	mongoURI
};
