require('dotenv').config();

const TOKEN = process.env.DISCORD_TOKEN;
const PREFIX = process.env.PREFIX;

module.exports = {
    TOKEN,
    PREFIX
}