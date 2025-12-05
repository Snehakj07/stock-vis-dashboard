const fs = require('fs');
const path = require('path');
const https = require('https');

// Kaggle dataset: https://www.kaggle.com/datasets/hershyandrew/amzn-dpz-btc-ntfx-adjusted-may-2013may2019
// This script will download and process the CSV files

const DATASET_URL = 'https://www.kaggle.com/api/v1/datasets/download/hershyandrew/amzn-dpz-btc-ntfx-adjusted-may-2013may2019';
const TICKERS = ['AMZN', 'DPZ', 'BTC', 'NFLX']; // NTFX is likely NFLX (Netflix)
const OUTPUT_FILE = path.join(__dirname, '../data/stocks.json');

// Note: This requires Kaggle API credentials
// Alternative: User can manually download from Kaggle and place CSV files in data/raw/

function parseCSV(csvContent) {
    const lines = csvContent.trim().split('\n');
    const headers = lines[0].split(',');

    return lines.slice(1).map(line => {
        const values = line.split(',');
        const obj = {};
        headers.forEach((header, index) => {
            obj[header.trim()] = values[index]?.trim();
        });
        return obj;
    });
}

function calculateSMA(data, period) {
    return data.map((item, index, array) => {
        if (index < period - 1) return null;
        const slice = array.slice(index - period + 1, index + 1);
        const sum = slice.reduce((acc, d) => acc + parseFloat(d.close), 0);
        return parseFloat((sum / period).toFixed(2));
    });
}

function calculateDailyReturns(data) {
    return data.map((item, index, array) => {
        if (index === 0) return 0;
        const prevClose = parseFloat(array[index - 1].close);
        const currClose = parseFloat(item.close);
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

function processStockData(csvData) {
    // Expected CSV format: Date,Open,High,Low,Close,Volume
    const parsed = parseCSV(csvData);

    const processed = parsed.map(row => ({
        date: row.Date || row.date,
        open: parseFloat(row.Open || row.open),
        high: parseFloat(row.High || row.high),
        low: parseFloat(row.Low || row.low),
        close: parseFloat(row.Close || row.close),
        volume: parseInt(row.Volume || row.volume || 0)
    }));

    // Calculate indicators
    const dailyReturns = calculateDailyReturns(processed);
    const sma20 = calculateSMA(processed, 20);
    const sma50 = calculateSMA(processed, 50);
    const sma100 = calculateSMA(processed, 100);
    const volatility = calculateVolatility(dailyReturns, 20);

    return processed.map((item, index) => ({
        ...item,
        sma20: sma20[index],
        sma50: sma50[index],
        sma100: sma100[index],
        daily_return: dailyReturns[index],
        volatility: volatility[index]
    }));
}

async function downloadAndProcess() {
    console.log('📥 Downloading Kaggle dataset...');
    console.log('⚠️  Note: This requires Kaggle API credentials');
    console.log('');
    console.log('Alternative: Download manually from:');
    console.log('https://www.kaggle.com/datasets/hershyandrew/amzn-dpz-btc-ntfx-adjusted-may-2013may2019');
    console.log('');
    console.log('Place CSV files in: data/raw/');
    console.log('Files should be named: AMZN.csv, DPZ.csv, BTC.csv, NFLX.csv');
    console.log('');

    const rawDataDir = path.join(__dirname, '../data/raw');

    // Check if raw data exists
    if (!fs.existsSync(rawDataDir)) {
        console.log('❌ data/raw/ directory not found');
        console.log('Please download the dataset manually and create data/raw/ folder');
        return;
    }

    const stockData = {};
    let filesProcessed = 0;

    for (const ticker of TICKERS) {
        const csvPath = path.join(rawDataDir, `${ticker}.csv`);

        if (fs.existsSync(csvPath)) {
            console.log(`✓ Processing ${ticker}.csv...`);
            const csvContent = fs.readFileSync(csvPath, 'utf-8');
            stockData[ticker] = processStockData(csvContent);
            filesProcessed++;
        } else {
            console.log(`⚠️  ${ticker}.csv not found in data/raw/`);
        }
    }

    if (filesProcessed === 0) {
        console.log('');
        console.log('❌ No CSV files found. Please download the dataset first.');
        return;
    }

    // Ensure output directory exists
    const outputDir = path.dirname(OUTPUT_FILE);
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    // Write processed data
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(stockData, null, 2));
    console.log('');
    console.log(`✅ Successfully processed ${filesProcessed} stocks`);
    console.log(`📁 Data saved to: ${OUTPUT_FILE}`);
    console.log('');
    console.log('Stocks included:', Object.keys(stockData).join(', '));
}

downloadAndProcess().catch(console.error);
