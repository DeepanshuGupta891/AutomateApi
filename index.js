require('dotenv').config();
const axios = require('axios');
const express = require('express');

const app = express();

const TOKEN_URL = 'https://backstage.taboola.com/backstage/oauth/token';
const DATA_URL = 'https://backstage.taboola.com/backstage/api/1.0/gamesflyindia-gameskite/reports/revenue-summary/dimensions/platform_breakdown?start_date=2024-06-18&end_date=2024-07-24';

const CLIENT_ID = process.env.CLIENT_ID || '980b3d6a5b2941489e6ac400799e1f82';
const CLIENT_SECRET = process.env.CLIENT_SECRET || 'd77e327728ca448bbd6d9cdd36eec815';

app.get('/fetch-data', async (req, res) => {
    try {
        // Fetch token from Taboola
        const tokenResponse = await axios.post(TOKEN_URL, new URLSearchParams({
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET,
            grant_type: 'client_credentials'
        }), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        const accessToken = tokenResponse.data.access_token;

        // Fetch the publisher data
        const response = await axios.get(DATA_URL, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });

        if (response.data.results && response.data.results.length > 0) {
            const result = response.data.results[0];
            const filteredData = {
                platform: result.platform,
                page_views: result.page_views,
                ad_cpc: result.ad_cpc,
                ad_revenue: result.ad_revenue
            };

            // Send filtered data as JSON response
            res.setHeader('Content-Type', 'application/json');
            res.json(filteredData);
        } else {
            res.status(404).send('No data found');
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('An error occurred');
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
