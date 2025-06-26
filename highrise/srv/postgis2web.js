require('dotenv').config();

const express = require('express');
const morgan = require('morgan'); 
const { getIsolineData, getPostGISData } = require('./analysis');

const app = express();
const port = process.env.SERVPORT;
const apiKey = process.env.GEOAPIFY_API_KEY; 

if (!apiKey) {
    console.error("Error: GEOAPIFY_API_KEY environment variable not set.");
    process.exit(1);
}

app.use(morgan('dev')); 
app.use(express.static('public'));


app.get('/api/highrise', async (req, res) => {
    try {
        const geoJSON = await getPostGISData();
        res.json(geoJSON);
    } catch (err) {
        console.error(err);
        res.status(500).send(`Error fetching data from database. \n\n ${err}`);
    }
});


app.get('/', (req, res) => {
    res.sendFile(path.join(pubDir, 'index.html'));
});

 
app.get('/api/adress', async (req, res) => {
    try {
        const { lat, lon } = req.query;
        const data = await getIsolineData(lat, lon, apiKey);
        res.json(data);
    } catch (error) {
        console.error(`Error fetching adress data from Geoapify: ${error.message}`);
        res.status(500).json({ error: `Failed to fetch adress data: ${error.message}` });
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
