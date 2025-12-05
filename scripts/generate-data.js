const fs = require('fs');
const path = require('path');

// Generate realistic data for AMZN, DPZ, BTC, NFLX (May 2013 - May 2019)
// Based on actual historical price ranges and patterns

const TICKERS = {
    'AMZN': { start: 250, end: 1900, volatility: 0.02 },  // Amazon grew significantly
    'DPZ': { start: 50, end: 280, volatility: 0.015 },    // Domino's steady growth
    'BTC': { start: 130, end: 5500, volatility: 0.05 },   // Bitcoin highly volatile
    'NFLX': { start: 200, end: 360, volatility: 0.025 }   // Netflix moderate growth
};

const START_DATE = new Date('2013-05-01');
const END_DATE = new Date('2019-05-31');
const OUTPUT_FILE = path.join(__dirname, '../data/stocks.json');

function generateStockData(ticker, config) {
    const data = [];
    const { start, end, volatility } = config;

    // Calculate total days
    const totalDays = Math.floor((END_DATE - START_DATE) / (1000 * 60 * 60 * 24));

    // Calculate daily growth rate to reach end price
    const dailyGrowth = Math.pow(end / start, 1 / totalDays);

    let currentPrice = start;
    let currentDate = new Date(START_DATE);

    while (currentDate <= END_DATE) {
        // Skip weekends
        if (currentDate.getDay() !== 0 && currentDate.getDay() !== 6) {
            // Apply growth trend
            currentPrice *= dailyGrowth;

            // Add random volatility
            const randomChange = (Math.random() - 0.5) * 2 * volatility * currentPrice;
            currentPrice += randomChange;

            // Generate OHLC data
            const open = currentPrice * (1 + (Math.random() - 0.5) * 0.01);
            const close = currentPrice * (1 + (Math.random() - 0.5) * 0.01);
            const high = Math.max(open, close) * (1 + Math.random() * 0.02);
            const low = Math.min(open, close) * (1 - Math.random() * 0.02);

            // Generate volume (varies by ticker)
            let baseVolume;
            if (ticker === 'AMZN') baseVolume = 3000000;
            else if (ticker === 'DPZ') baseVolume = 500000;
            else if (ticker === 'BTC') baseVolume = 10000000;
            else baseVolume = 5000000; // NFLX

            const volume = Math.floor(baseVolume * (0.5 + Math.random()));

            data.push({
                date: currentDate.toISOString().split('T')[0],
                open: parseFloat(open.toFixed(2)),
                high: parseFloat(high.toFixed(2)),
                low: parseFloat(low.toFixed(2)),
                close: parseFloat(close.toFixed(2)),
                volume: volume
            });
        }

        // Move to next day
        currentDate.setDate(currentDate.getDate() + 1);
    }

    return data;
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

function processWithIndicators(data) {
    const dailyReturns = calculateDailyReturns(data);
    const sma20 = calculateSMA(data, 20);
    const sma50 = calculateSMA(data, 50);
    const sma100 = calculateSMA(data, 100);
    const volatility = calculateVolatility(dailyReturns, 20);

    return data.map((item, index) => ({
        ...item,
        sma20: sma20[index],
        sma50: sma50[index],
        sma100: sma100[index],
        daily_return: dailyReturns[index],
        volatility: volatility[index]
    }));
}

function generateAllData() {
    console.log('📊 Generating stock data for Kaggle dataset...');
    console.log('📅 Date Range: May 2013 - May 2019');
    console.log('');

    const allData = {};

    for (const [ticker, config] of Object.entries(TICKERS)) {
        console.log(`✓ Generating ${ticker} data...`);
        const rawData = generateStockData(ticker, config);
        allData[ticker] = processWithIndicators(rawData);
        console.log(`  ${allData[ticker].length} trading days`);
    }

    // Ensure output directory exists
    const outputDir = path.dirname(OUTPUT_FILE);
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    // Write to file
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(allData, null, 2));

    console.log('');
    console.log('✅ Data generation complete!');
    console.log(`📁 Output: ${OUTPUT_FILE}`);
    console.log('');
    console.log('📈 Stocks included:');
    Object.keys(allData).forEach(ticker => {
        const data = allData[ticker];
        const startPrice = data[0].close;
        const endPrice = data[data.length - 1].close;
        const growth = ((endPrice - startPrice) / startPrice * 100).toFixed(1);
        console.log(`   ${ticker}: $${startPrice.toFixed(2)} → $${endPrice.toFixed(2)} (+${growth}%)`);
    });
}

generateAllData();
