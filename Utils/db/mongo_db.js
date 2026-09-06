require("dotenv").config();

const customDns = require('dns');
customDns.setServers(['8.8.8.8', '1.1.1.1']);

const dns = require("dns");
dns.setDefaultResultOrder("ipv4first");

const mongoose = require("mongoose");

async function connectDB() {
  try {
    await mongoose.connect(process.env.DB_LINK);
    console.log("MongoDB Atlas connecté");
  } catch (err) {
    console.error("Erreur MongoDB :", err);
  }
}

connectDB();