//DEMO skripta za dodavanje novih proizvoda

require("dotenv").config();
const mongoose = require("mongoose");
const Product = require("./models/Product");
const Category = require("./models/Category");

mongoose
    .connect(process.env.MONGO_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(async () => {
        console.log("✅ Povezano sa MongoDB");

        await Product.deleteMany();
        const kategorije = await Category.find();

        const mapa = {};
        kategorije.forEach((kat) => {
            mapa[kat.naziv] = kat._id;
        });

        const proizvodi = [
            // PICE
            {
                naziv: "Capricciosa",
                opis: "Pelat, kačkavalj, šunka, pečurke",
                cena: 850,
                slika: "/uploads/proizvodi/capricciosa.png",
                kategorijaId: mapa["Pice"],
                redniBroj: 1,
                nedostupan: false,
            },
            {
                naziv: "Vesuvio",
                opis: "Pelat, kačkavalj, šunka",
                cena: 790,
                slika: "/uploads/proizvodi/vesuvio.png",
                kategorijaId: mapa["Pice"],
                redniBroj: 2,
                nedostupan: false,
            },

            // GLAVNA JELA
            {
                naziv: "Bečka šnicla",
                opis: "Teleća šnicla pohovana, pomfrit",
                cena: 1150,
                slika: "/uploads/proizvodi/becka.png",
                kategorijaId: mapa["Glavna jela"],
                redniBroj: 1,
                nedostupan: false,
            },
            {
                naziv: "Pileći file u sosu od pečuraka",
                opis: "Piletina, pavlaka, šampinjoni",
                cena: 1050,
                slika: "/uploads/proizvodi/file.png",
                kategorijaId: mapa["Glavna jela"],
                redniBroj: 2,
                nedostupan: false,
            },

            // ČORBE
            {
                naziv: "Teleća čorba",
                opis: "Krem čorba od teletine i povrća",
                cena: 420,
                slika: "/uploads/proizvodi/telecaCorba.png",
                kategorijaId: mapa["Čorbe"],
                redniBroj: 1,
                nedostupan: false,
            },
            {
                naziv: "Paradajz čorba",
                opis: "Topla čorba od paradajza i začina",
                cena: 350,
                slika: "/uploads/proizvodi/paradajz.png",
                kategorijaId: mapa["Čorbe"],
                redniBroj: 2,
                nedostupan: false,
            },

            // PREDJELA
            {
                naziv: "Meze plata",
                opis: "Pršuta, kulen, sir, masline",
                cena: 950,
                slika: "/uploads/proizvodi/meze.png",
                kategorijaId: mapa["Predjela"],
                redniBroj: 1,
                nedostupan: false,
            },
            {
                naziv: "Bruskete",
                opis: "Tostirani hleb, paradajz, bosiljak",
                cena: 520,
                slika: "/uploads/proizvodi/bruskete.png",
                kategorijaId: mapa["Predjela"],
                redniBroj: 2,
                nedostupan: false,
            },

            // DEZERT
            {
                naziv: "Čokoladni sufle",
                opis: "Topli kolač sa tečnom čokoladom",
                cena: 590,
                slika: "/uploads/proizvodi/sufle.png",
                kategorijaId: mapa["Dezert"],
                redniBroj: 1,
                nedostupan: false,
            },
            {
                naziv: "Palačinke sa nutelom",
                opis: "Palačinke, nutela, lešnik",
                cena: 490,
                slika: "/uploads/proizvodi/palacinke.png",
                kategorijaId: mapa["Dezert"],
                redniBroj: 2,
                nedostupan: false,
            },

            // KAFE
            {
                naziv: "Espresso",
                opis: "Jednostruki espresso",
                cena: 160,
                slika: "/uploads/proizvodi/espresso.png",
                kategorijaId: mapa["Kafe"],
                redniBroj: 1,
                nedostupan: false,
            },
            {
                naziv: "Latte",
                opis: "Espresso sa toplim mlekom",
                cena: 230,
                slika: "/uploads/proizvodi/latte.png",
                kategorijaId: mapa["Kafe"],
                redniBroj: 2,
                nedostupan: false,
            },

            // SOKOVI
            {
                naziv: "Cedevita narandža",
                opis: "Osvežavajući instant napitak",
                cena: 250,
                slika: "/uploads/proizvodi/cedevita.png",
                kategorijaId: mapa["Sokovi"],
                redniBroj: 1,
                nedostupan: false,
            },
            {
                naziv: "Coca-Cola 0.25l",
                opis: "Klasičan gazirani napitak",
                cena: 270,
                slika: "/uploads/proizvodi/cola.png",
                kategorijaId: mapa["Sokovi"],
                redniBroj: 2,
                nedostupan: false,
            },

            // VINA
            {
                naziv: "Vranac 0.2l",
                opis: "Crveno vino, suvo",
                cena: 480,
                slika: "/uploads/proizvodi/vranac.png",
                kategorijaId: mapa["Vina"],
                redniBroj: 1,
                nedostupan: false,
            },
            {
                naziv: "Chardonnay 0.2l",
                opis: "Belo vino, polusuvo",
                cena: 520,
                slika: "/uploads/proizvodi/chardonnay.png",
                kategorijaId: mapa["Vina"],
                redniBroj: 2,
                nedostupan: false,
            },
        ];

        await Product.insertMany(proizvodi);
        console.log("✅ Proizvodi ubačeni!");
        process.exit();
    })
    .catch((err) => {
        console.error("❌ Greška:", err);
        process.exit(1);
    });
