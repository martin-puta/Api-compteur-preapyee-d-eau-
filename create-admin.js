const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

require("dotenv").config();

const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const Admin = require("./Models/Admin_Users");

async function createAdmin() {
    try {
        console.log("Connexion à MongoDB en cours...");
        await mongoose.connect(process.env.DB_LINK);

        const email = "admin@compteur.com";
        const password = "Admin123456";
        const hashedPassword = await bcrypt.hash(password, 10);

        const existingAdmin = await Admin.findOne({ email });

        if (existingAdmin) {
            console.log("ℹ️ Cet administrateur existe déjà dans la base.");
            process.exit(0);
        }

        const admin = new Admin({
            name: "Admin",
            email: email,
            password: hashedPassword,
            socketId: "none", // Remplacé par une valeur non vide pour passer la validation Mongoose
            isActive: true
        });

        await admin.save();

        console.log("✅ Administrateur créé avec succès !");
        console.log("Email :", email);
        console.log("Mot de passe :", password);

        process.exit(0);

    } catch (error) {
        console.error("❌ Erreur de création :", error);
        process.exit(1);
    }
}

createAdmin();