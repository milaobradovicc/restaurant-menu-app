require("dotenv").config();

const mongoose = require("mongoose");
const Product = require("../models/Product");

const MONGO_URL = process.env.MONGO_URL;

mongoose.connect(MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

mongoose.connection.once("open", async () => {
    try {
        const proizvodi = await Product.find();
        let brojac = 0;

        for (let proizvod of proizvodi) {
            let izmenjen = false;

            if (proizvod.nedostupan === undefined) {
                proizvod.nedostupan = false;
                izmenjen = true;
            }

            if (proizvod.novo === undefined) {
                proizvod.novo = false;
                izmenjen = true;
            }

            if (izmenjen) {
                await proizvod.save();
                console.log(`✅ Ažurirano: ${proizvod.naziv}`);
                brojac++;
            }
        }

        if (brojac === 0) {
            console.log("ℹ️ Nema proizvoda za ažuriranje. Sva polja već postoje.");
        } else {
            console.log(`🎉 Ukupno ažurirano: ${brojac} proizvoda`);
        }
    } catch (err) {
        console.error("❌ Greška pri ažuriranju:", err);
    } finally {
        mongoose.connection.close();
    }
});
