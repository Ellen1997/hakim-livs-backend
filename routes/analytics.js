const express = require("express");
const router = express.Router();
const Order = require("../models/userOrders");
const { authenticateToken, isAdmin } = require("../middleware/auth");

//endast admin får tillgång, token krävs för att köra get
router.use(authenticateToken, isAdmin)

router.get("/revenue-per-month", async (req, res) => {
    try {
        //hämta alla ordrar från databasen
        const allaOrdrar = await Order.find()
        const intäkt = {};

        //dagens datum, så att vi kan räkna 12 månader bak i tiden
        const idag = new Date()

        
        //loopar 12 månader bak i tiden, - i, 1
        for (let i =0; i < 12; i++) {
            const månadStart = new Date(idag.getFullYear(), idag.getMonth() - i, 1)

            //skapar en nyckel som kommer representera månad-år
            const key = `${månadStart.toLocaleString("default", { month: "long" })}-${månadStart.getFullYear()}`;
            intäkt[key] = 0;
        

        } 

        allaOrdrar.forEach(order => {

            //leta fram när ordern skapades
            const datum = new Date(order.createdAt);

            //skapar samma nyckel som tidigare, månad-år
            const key =  `${datum.toLocaleString("default", { month: "long" })}-${datum.getFullYear()}`


            // Om månad nyckeln redan finns i objektet (alltså inte är undefined), lägg till orderns summa på rätt månad
            if (intäkt[key] !== undefined) {
                intäkt[key] += order.total;
            }
        })

        res.status(200).json(intäkt)
    }catch (error) {
        res.status(500).json({error: "Hämtning av alla intäkter misslyckades..."})
    }
})


router.get("/top-customers", async (req, res) => {
    try {
        const allaOrdrar = await Order.find()

        const spenderatPerKund = {};


        //går igemom alla ordrar, och plockar ut email från dem
        allaOrdrar.forEach(order => {
            const email = order.user.email;
            
            //om det är en ny email som inte fanns tidigare, plockas den ut 
            //och spenderat värde sätts till 0
            if(!spenderatPerKund[email]) {
                spenderatPerKund[email] = 0
            
            }
            
            //orderns belopp läggs till i kundens totalsumma 
            spenderatPerKund[email] += order.total
        })


        //sortering för att få fram top 5 kunder
        const topFem = Object.entries(spenderatPerKund)  //gör om objektet till en array
        .sort((a, b) => b[1] - a[1]) //sorterar så att den som spenderat mest kommer först
        .slice(0, 5) // tar fram topp 5
        .map(kund => {
            return { //skapar ett nytt objekt för varje kund så det blir email - total
                email: kund[0],
                total: kund[1]
            }
        })

        res.status(200).json(topFem)

    }catch (error) {
        res.status(500).json({ error: "Kunde inte hämta toppkunder." })
    }
})

module.exports = router;
