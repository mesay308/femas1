const http = require('http');

http.get('http://localhost:5000/api/categories', (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        console.log('\n--- GET /api/categories ---');
        try {
            const json = JSON.parse(data);
            console.log(JSON.stringify(json, null, 2));
        } catch {
            console.log(data);
        }
    });
}).on('error', err => {
    console.error('Error fetching categories:', err.message);
});
