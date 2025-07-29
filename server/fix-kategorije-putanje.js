require("dotenv").config();
const mongoose = require("mongoose");
const Category = require("./models/Category");

mongoose
    .connect(process.env.MONGO_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(async () => {
        console.log("✅ Povezano sa MongoDB");

        const kategorije = await Category.find();
        kategorije.forEach((k) => {
            console.log(`${k.naziv}: ${k.slika}`);
        });

        let brojIspravljenih = 0;

        for (let kat of kategorije) {
            if (
                kat.slika &&
                kat.slika.startsWith("/uploads/") &&
                !kat.slika.startsWith("/uploads/kategorije/")
            ) {
                // Izdvoji samo ime fajla
                const imeFajla = kat.slika.split("/").pop();
                kat.slika = `/uploads/kategorije/${imeFajla}`;
                await kat.save();
                brojIspravljenih++;
                console.log(`✔️ Ispravljena: ${kat.naziv}`);
            }
        }

        console.log(`🎉 Ukupno ispravljeno: ${brojIspravljenih}`);
        process.exit();
    })
    .catch((err) => {
        console.error("❌ Greška:", err);
        process.exit(1);
    });
