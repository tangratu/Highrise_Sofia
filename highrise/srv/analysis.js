const { Pool } = require('pg');

const fetch = require('node-fetch');
const { URLSearchParams } = require('url');
const path = require('path');


function getPgPool() {
    const dbConfig = {
        user: process.env.PGUSER,
        host: process.env.PGHOST,
        database: process.env.PGDATABASE,
        password: process.env.PGPASSWORD,
        port: process.env.PGPORT,
        client_encoding: process.env.PGCLIENTENCODING,
        ssl: false
    };
    return new Pool(dbConfig);
}



async function getIsolineData(lat, lon, apiKey) {
    if (!apiKey) {
        throw new Error("GEOAPIFY_API_KEY environment variable not set.");
    }

    if (!lat || !lon) {
        throw new Error("Missing required parameters (lat, lon)");
    }

   

    const baseUrl = 'https://api.geoapify.com/v1/geocode/reverse';
    const params = new URLSearchParams({
        lat, lon,
        apiKey
    });
    const geoapifyUrl = `${baseUrl}?${params.toString()}`;

    const response = await fetch(geoapifyUrl);
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Geoapify API error: ${response.status} - ${errorText}`);
    }

    return await response.json();
}

async function getPostGISData() {
    const pool = getPgPool();
    let conn;
    try {
        conn = await pool.connect();
        const resDb = await conn.query(`
            SELECT ST_AsGeoJSON(
                        ST_Transform(wkb_geometry, 4326)) as geojson
                        
            FROM public.alt_algo`);
        return {
            type: 'FeatureCollection',
            features: resDb.rows.map(row => ({
                type: 'Feature',
                geometry: JSON.parse(row.geojson)                
            }))
        };
    } finally {
        if (conn) {
            conn.release();
        }
    }
}



module.exports = {
    getIsolineData,
    getPostGISData
    
};
