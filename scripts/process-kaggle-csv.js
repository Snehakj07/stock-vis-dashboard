const fs = require('fs');
const path = require('path');

// This script processes the Kaggle CSV data into our JSON format
// The CSV has columns: Date,AMZN,DPZ,BTC,NFLX

function parseCSV(csvContent) {
    const lines = csvContent.trim().split('\n');
    const headers = lines[0].split(',');

    // Initialize data structure for each ticker
    const stockData = {
        'AMZN': [],
        'DPZ': [],
        'BTC': [],
        'NFLX': []
    };

    // Parse each row
    for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',');
        const date = values[0];

        // Add data for each ticker
        ['AMZN', 'DPZ', 'BTC', 'NFLX'].forEach((ticker, idx) => {
            const price = parseFloat(values[idx + 1]);
            if (!isNaN(price)) {
                stockData[ticker].push({
                    date: date,
                    close: price,
                    open: price,
                    high: price,
                    low: price,
                    volume: 1000000 // Default volume since CSV doesn't have it
                });
            }
        });
    }

    return stockData;
}

function calculateSMA(data, period) {
    return data.map((item, index, array) => {
        if (index < period - 1) return null;
        const slice = array.slice(index - period + 1, index + 1);
        const sum = slice.reduce((acc, d) => acc + d.close, 0);
        return parseFloat((sum / period).toFixed(2));
    });
}

function calculateDailyReturns(data) {
    return data.map((item, index, array) => {
        if (index === 0) return 0;
        const prevClose = array[index - 1].close;
        const currClose = item.close;
        return parseFloat(((currClose - prevClose) / prevClose).toFixed(4));
    });
}

function calculateVolatility(returns, window = 20) {
    return returns.map((_, index, array) => {
        if (index < window) return null;
        const slice = array.slice(index - window + 1, index + 1);
        const mean = slice.reduce((a, b) => a + b, 0) / window;
        const variance = slice.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / window;
        return parseFloat(Math.sqrt(variance).toFixed(4));
    });
}

function addIndicators(stockData) {
    const result = {};

    for (const [ticker, data] of Object.entries(stockData)) {
        const dailyReturns = calculateDailyReturns(data);
        const sma20 = calculateSMA(data, 20);
        const sma50 = calculateSMA(data, 50);
        const sma100 = calculateSMA(data, 100);
        const volatility = calculateVolatility(dailyReturns, 20);

        result[ticker] = data.map((item, index) => ({
            ...item,
            sma20: sma20[index],
            sma50: sma50[index],
            sma100: sma100[index],
            daily_return: dailyReturns[index],
            volatility: volatility[index]
        }));
    }

    return result;
}

// Check if CSV file exists
const csvPath = path.join(__dirname, '../data/raw/kaggle_stock_data.csv');
const outputPath = path.join(__dirname, '../data/stocks.json');

if (!fs.existsSync(csvPath)) {
    console.log('❌ CSV file not found at:', csvPath);
    console.log('Please save the Kaggle CSV data to this location first.');
    process.exit(1);
}

console.log('📊 Processing Kaggle dataset...');
const csvContent = fs.readFileSync(csvPath, 'utf-8');
const parsedData = parseCSV(csvContent);
const processedData = addIndicators(parsedData);

// Write output
fs.writeFileSync(outputPath, JSON.stringify(processedData, null, 2));

console.log('✅ Processing complete!');
console.log(`📁 Output: ${outputPath}`);
console.log('');
console.log('📈 Data summary:');
Object.entries(processedData).forEach(([ticker, data]) => {
    const start = data[0].close;
    const end = data[data.length - 1].close;
    const growth = ((end - start) / start * 100).toFixed(1);
    console.log(`   ${ticker}: ${data.length} days, $${start.toFixed(2)} → $${end.toFixed(2)} (${growth}%)`);
});
