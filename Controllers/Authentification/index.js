// Logical Methods for Login and registers routers
// Nodemail configuration
const nodemailer = require("nodemailer");
const cloudinary = require("cloudinary").v2;
const fs = require("fs");

// Lib and functions
const otp_generator = require("otp-generator");
require("dotenv").config();
const bcrypt = require("bcrypt"); // salting password Methode
const jwt = require("jsonwebtoken");
const SALTE_PWD = 10;

// Models
const modelOfUsers = require("../../Models/Users"); // import model of Others user
const modelOfAdminUsers = require("../../Models/Admin_Users"); // import model of Admin user

// =====================================================
// ADMIN LOGIN CONTROLLER
// =====================================================
exports.Adminlogin = (req, res) => {
    const InAuthorizationMsg = "email ou mot de pass d'utilisateur Incorrect";

    console.log(req.body);

    modelOfAdminUsers
        .findOne({ email: req.body.email })
        .then(userFund => {
            if (userFund === null) {
                return res.status(401).json({ msg: InAuthorizationMsg });
            }

            console.log(userFund);

            bcrypt
                .compare(req.body.password, userFund.password)
                .then(valid => {
                    if (!valid) {
                        return res.status(401).json({ msg: InAuthorizationMsg });
                    }

                    const Token = jwt.sign(
                        {
                            idUser: userFund._id,
                            mail: userFund.email,
                        },
                        process.env.TOKEN_SIGN
                    );

                    return res.status(200).json({
                        msg: "Utilisateur trouvé",
                        Token,
                        DataUser: userFund,
                        typeAccount: userFund.typeAccount
                    });
                })
                .catch(error => {
                    console.log(error);
                    return res.status(500).json({ msg: "Error Server Token" });
                });
        })
        .catch(error => {
            console.log(`Error Database ${error}`);
            return res.status(500).json({ msg: "Erreur server" });
        });
};

// =====================================================
// OTHER USER LOGIN CONTROLLER
// =====================================================
exports.login = (req, res) => {
    const InAuthorizationMsg = "email ou mot de pass d'utilisateur Incorrect";
    const messageInactifAccount = "Ce Compte n'est pas encore Activé";

    modelOfUsers
        .findOne({ email: req.body.email })
        .then(userFound => {
            console.log(userFound);

            if (userFound === null) {
                return res.status(401).json({ msg: InAuthorizationMsg });
            }

            if (userFound.isActive) {
                bcrypt
                    .compare(req.body.password, userFound.passWord)
                    .then(valid => {
                        if (!valid) {
                            return res.status(401).json({ msg: InAuthorizationMsg });
                        }

                        const Token = jwt.sign(
                            {
                                idUser: userFound._id,
                                mail: userFound.email,
                            },
                            process.env.TOKEN_SIGN
                        );

                        return res.status(200).json({
                            msg: "Utilisateur trouvé",
                            Token,
                            DataUser: userFound
                        });
                    })
                    .catch(error => {
                        console.log(error);
                        return res.status(500).json({ msg: "Error Server Token" });
                    });
            } else {
                return res.status(401).json({ msg: messageInactifAccount });
            }
        })
        .catch(error => {
            console.log(`Error Database ${error}`);
            return res.status(500).json({ msg: "Erreur server" });
        });
};

// =====================================================
// SEND EMAIL FUNCTION
// =====================================================
const sendemail = async (name, email, otpCode) => {
    // Create transporter avec contournement TLS pour le dev local
    const transport = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
        },
        tls: {
            rejectUnauthorized: false
        }
    });

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Code d'activation de votre compte Smart Meter",
        html: `
            <div style="font-family: Arial, sans-serif;">
                <h2 style="color:#227ABD;">SMART METER</h2>
                <p>Cher(e) <b style="font-size:1.2em; color:#227ABD;">${name}</b>,</p>
                <p>Nous avons reçu votre demande d'activation de compte chez <b>SMART METER</b>.</p>
                <p>Votre code d'activation est :</p>
                <p><b style="font-size:2em; color:#00cc00; letter-spacing:5px;">${otpCode}</b></p>
                <p>Ce code doit rester privé.</p>
                <p>Si vous n'êtes pas à l'origine de cette demande, ignorez cet email.</p>
                <br>
                <p>Cordialement,<br><b>Équipe SMART METER</b></p>
            </div>
        `
    };

    try {
        const info = await transport.sendMail(mailOptions);
        console.log("====================================");
        console.log("EMAIL ENVOYÉ AVEC SUCCÈS");
        console.log("Destinataire :", email);
        console.log("Message ID :", info.messageId);
        console.log("====================================");
        return true;
    } catch (error) {
        console.error("====================================");
        console.error("ERREUR ENVOI EMAIL");
        console.error(error);
        console.error("====================================");
        return false;
    }
};

// =====================================================
// GENERATE OTP CODE
// =====================================================
exports.decodeUserOtp = (req, res, next) => {
    const idUser = req.body;
    const userNotFoundMsg = "Utilisateur non trouvé";

    modelOfUsers
        .findOne({ email: idUser.email })
        .then(userDatas => {
            if (userDatas) {
                req.name = `${userDatas.fname} ${userDatas.lname}`;
                req.email = `${userDatas.email}`;
                req.otp = otp_generator.generate(6, {
                    upperCaseAlphabets: false,
                    specialChars: false
                });

                console.log("====================================");
                console.log("NOUVEAU CODE OTP GÉNÉRÉ");
                console.log("Email :", req.email);
                console.log("OTP :", req.otp);
                console.log("====================================");

                next();
            } else {
                return res.status(404).json({ msg: userNotFoundMsg });
            }
        })
        .catch(error => {
            console.log(`Error Database ${error}`);
            return res.status(500).json({ msg: "Erreur server" });
        });
};

// =====================================================
// SAVE AND SEND OTP
// =====================================================
exports.getOpt = async (req, res) => {
    try {
        console.log("====================================");
        console.log("DEMANDE DE CODE D'ACTIVATION");
        console.log("Nom :", req.name);
        console.log("Email :", req.email);
        console.log("Code OTP :", req.otp);
        console.log("====================================");

        const updateResult = await modelOfUsers.updateOne(
            { email: req.email },
            { $set: { ActivationToken: req.otp } }
        );

        console.log("Résultat sauvegarde OTP :", updateResult);

        const emailSent = await sendemail(req.name, req.email, req.otp);

        if (!emailSent) {
            return res.status(500).json({
                msg: "Le code a été généré et enregistré, mais l'envoi de l'email a échoué."
            });
        }

        return res.status(201).json({
            msg: "Code d'activation envoyé avec succès"
        });

    } catch (error) {
        console.error("====================================");
        console.error("ERREUR GET OTP");
        console.error(error);
        console.error("====================================");

        return res.status(500).json({
            msg: "Erreur serveur lors de l'envoi du code"
        });
    }
};

// =====================================================
// CONFIRM OTP CODE
// =====================================================
exports.ConfirmOptCode = (req, res) => {
    const idUser = req.body;

    modelOfUsers
        .findOne({
            $and: [
                { email: idUser.email },
                { ActivationToken: idUser.Token }
            ]
        })
        .then(userDatas => {
            if (userDatas) {
                return res.status(200).json({ msg: "Valid Code of user" });
            } else {
                return res.status(401).json({ msg: "user not Found" });
            }
        })
        .catch(error => {
            console.log(`Error Database ${error}`);
            return res.status(500).json({ msg: "Erreur server" });
        });
};

// =====================================================
// ACTIVATION ACCOUNT
// =====================================================
exports.Activation_account = (req, res) => {
    const idUser = req.body;

    try {
        modelOfUsers
            .findOne({
                $and: [
                    { email: idUser.email },
                    { ActivationToken: idUser.Token }
                ]
            })
            .then(userFund => {
                if (userFund) {
                    if (userFund.isActive) {
                        return res.status(403).json({ msg: "Compte actif, Connectez-vous!" });
                    }

                    bcrypt
                        .hash(req.body.password, SALTE_PWD)
                        .then(passwordHash => {
                            modelOfUsers
                                .updateOne(
                                    {
                                        $and: [
                                            { email: idUser.email },
                                            { ActivationToken: idUser.Token }
                                        ]
                                    },
                                    {
                                        $set: {
                                            passWord: passwordHash,
                                            isActive: true,
                                            cover: idUser.secureCover,
                                            ActivationToken: null
                                        }
                                    }
                                )
                                .then(() => {
                                    return res.status(200).json({
                                        msg: "Activation du compte Reussi",
                                        Updating: true,
                                        actif: true
                                    });
                                })
                                .catch(error => {
                                    console.log(error);
                                    return res.status(500).json({
                                        msg: "Activation echouée, Error Server"
                                    });
                                });
                        })
                        .catch(error => {
                            console.log(`Erreur lors du hashing du password \n ${error}`);
                            return res.status(500).json({
                                msg: "Impossible d'activer le compte"
                            });
                        });
                } else {
                    return res.status(404).json({
                        msg: "Echec d'activation, identifiants non trouvés"
                    });
                }
            })
            .catch(error => {
                console.log(error);
                return res.status(500).json({ msg: "Error Server" });
            });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ msg: "Error Server" });
    }
};

// =====================================================
// HASH PASSWORD
// =====================================================
exports.HashingPassWord = (req, res) => {
    bcrypt
        .hash("Eliasone02@", SALTE_PWD)
        .then(passwordHash => {
            return res.status(200).json({ passwordHash });
        })
        .catch(error => {
            console.log(`Erreur lors du hashing du password \n ${error}`);
            return res.status(500).json({
                msg: "Impossible d'activer le compte -> Error Server lors du hashing du password"
            });
        });
};

// =====================================================
// REGISTER NEW USER
// =====================================================
exports.registerNewUser = (req, res) => {
    const DatasOfForm = req.body;

    const transport = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
        },
        tls: {
            rejectUnauthorized: false
        }
    });

    const newUser = new modelOfUsers(DatasOfForm);

    newUser
        .save()
        .then(datas => {
            res.status(200).json({ message: "'success': New User created" });

            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: DatasOfForm.email,
                subject: "Creation de compte reussi, Bienvenu sur la plateforme de gestion efficace d'eau",
                text: `Cher(e) ${DatasOfForm.fname} ${DatasOfForm.lname},\nBienvenue chez SMART METER.`
            };

            transport.sendMail(mailOptions, (error, infos) => {
                if (error) {
                    return console.log(`Error : ${error}`);
                }
                console.log(`Message sending ${infos.response}`);
            });
        })
        .catch(error => {
            console.log(error);
            res.status(501).json({ msg: "Echec de la creation du compte" });
        });
};

// =====================================================
// UPLOAD IMAGE
// =====================================================
exports.uploadImage = (req, res) => {
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    try {
        cloudinary.uploader
            .upload(
                req.file.path,
                {
                    folder: "image-smartMeter",
                    transformation: {
                        width: 300,
                        height: 300,
                        crop: "limit"
                    }
                }
            )
            .then(datas => {
                fs.unlinkSync(req.file.path);

                return res.status(201).json({
                    Url: datas.url,
                    secureUrl: datas.secure_url
                });
            })
            .catch(error => {
                console.log(error);
                return res.status(501).json({
                    msg: "Deployement image Error Server"
                });
            });
    } catch (error) {
        return res.status(501).json({
            msg: "Deployement image Error Server"
        });
    }
};