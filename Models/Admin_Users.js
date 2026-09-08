const Admin = require("../Models/Admin_Users");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

exports.loginAdmin = (req, res) => {
    // 1. Recherche de l'administrateur par son email
    Admin.findOne({ email: req.body.email })
        .then(userFund => {
            if (!userFund) {
                return res.status(404).json({
                    msg: "Utilisateur non trouvé !"
                });
            }

            // 2. Comparaison avec la clé "password" (et pas "passWord")
            bcrypt.compare(req.body.password, userFund.password)
                .then(valid => {
                    if (!valid) {
                        return res.status(401).json({
                            msg: "Email ou mot de passe incorrect !"
                        });
                    }

                    // 3. Génération du token JWT
                    const Token = jwt.sign(
                        {
                            idUser: userFund._id,
                            mail: userFund.email,
                        },
                        process.env.TOKEN_SIGN,
                        { expiresIn: "24h" }
                    );

                    return res.status(200).json({
                        msg: "Connexion réussie",
                        Token,
                        DataUser: userFund
                    });
                })
                .catch(error => {
                    console.log("Erreur bcrypt :", error);
                    return res.status(500).json({
                        msg: "Erreur lors de la vérification du mot de passe"
                    });
                });
        })
        .catch(error => {
            console.log("Erreur serveur :", error);
            return res.status(500).json({
                msg: "Erreur serveur"
            });
        });
};