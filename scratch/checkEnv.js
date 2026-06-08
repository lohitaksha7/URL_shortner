require('dotenv').config();
console.log("GOOGLE_CLIENT_ID:", process.env.GOOGLE_CLIENT_ID ? "LOADED" : "NOT_LOADED");
console.log("Value length:", process.env.GOOGLE_CLIENT_ID ? process.env.GOOGLE_CLIENT_ID.length : 0);
console.log("Raw Value:", `[${process.env.GOOGLE_CLIENT_ID}]`);
