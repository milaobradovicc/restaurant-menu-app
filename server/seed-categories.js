//DEMO skripta za dodavanje novih kategorija

require("dotenv").config();
const mongoose = require("mongoose");
const Category = require("./models/Category"); // koristi tvoj model

mongoose
    .connect(process.env.MONGO_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(async () => {
        console.log("✅ Povezano sa MongoDB");

        // Očisti stare kategorije ako ih ima
        await Category.deleteMany();

        // Dodaj nove
        const kategorije = [
            {
                naziv: "Pice",
                slika: "/uploads/kategorije/pice.jpg",
                redniBroj: 1,
            },
            {
                naziv: "Glavna jela",
                slika: "/uploads/kategorije/glavnaJela.jpg",
                redniBroj: 2,
            },
            {
                naziv: "Čorbe",
                slika: "/uploads/kategorije/corbe.jpg",
                redniBroj: 3,
            },

            {
                naziv: "Predjela",
                slika: "/uploads/kategorije/predjela.jpg",
                redniBroj: 4,
            },
            {
                naziv: "Dezert",
                slika: "/uploads/kategorije/dezert.jpg",
                redniBroj: 5,
            },
            {
                naziv: "Kafe",
                slika: "/uploads/kategorije/kafe.jpg",
                redniBroj: 6,
            },
            {
                naziv: "Sokovi",
                slika: "/uploads/kategorije/sokovi.jpg",
                redniBroj: 7,
            },
            {
                naziv: "Vina",
                slika: "/uploads/kategorije/vina.png",
                redniBroj: 8,
            },
        ];

        await Category.insertMany(kategorije);
        console.log("✅ Kategorije ubačene!");
        process.exit();
    })
    .catch((err) => {
        console.error("❌ Greška:", err);
        process.exit(1);
    });
