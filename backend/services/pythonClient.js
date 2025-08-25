const axios = require('axios'); 

const TIMEOUT = 10_000;

async function getSimilarFromPython(pyUrl, seedBookIds, TopN = 10) {
    try {
        const { data } = await axios.post(
            `${pyUrl}/similar`,
            { book_id: seedBookIds, top_n: TopN }, // <-- fixed key name
            { timeout: TIMEOUT }
        );
        return data;
    } catch (err) {
        console.error('Error fetching similar books from Python service:', err.message);
        return { similar: [] };
    }
}

module.exports = { getSimilarFromPython };
