const fs = require('fs');
const path = require('path');

// Mock data generation since we can't easily install python packages and yahoo-finance2 might need install
// We will generate realistic looking data for AAPL, TSLA, MSFT
// This ensures the dashboard works immediately without external dependencies issues

const TICKERS = ['AAPL', 'TSLA', 'MSFT'];
const DAYS = 365 * 2; // 2 years
const OUTPUT_FILE = path.join(__dirname, '../data/stocks.json');

function generateData() {
    const data = {};

    TICKERS.forEach(ticker => {
        let price = ticker === 'AAPL' ? 150 : ticker === 'TSLA' ? 200 : 300;
        const records = [];
        const now = new Date();

        for (let i = DAYS; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(date.getDate() - i);

            // Random walk
            const change = (Math.random() - 0.5) * (price * 0.05);
            price += change;

            const open = price - (Math.random() - 0.5) * 2;
            const close = price;
            const high = Math.max(open, close) + Math.random() * 2;
            const low = Math.min(open, close) - Math.random() * 2;
            const volume = Math.floor(Math.random() * 1000000) + 500000;

            records.push({
                date: date.toISOString().split('T')[0],
                open: parseFloat(open.toFixed(2)),
                high: parseFloat(high.toFixed(2)),
                low: parseFloat(low.toFixed(2)),
                close: parseFloat(close.toFixed(2)),
                volume: volume,
                // SMAs and Volatility will be calculated in a second pass or here if simple
            });
        }

        // Calculate Indicators
        const processed = records.map((record, index, array) => {
            // SMA 20
            let sma20 = null;
            if (index >= 19) {
                const slice = array.slice(index - 19, index + 1);
                sma20 = slice.reduce((sum, r) => sum + r.close, 0) / 20;
            }

            // SMA 50
            let sma50 = null;
            if (index >= 49) {
                const slice = array.slice(index - 49, index + 1);
                sma50 = slice.reduce((sum, r) => sum + r.close, 0) / 50;
            }

            // SMA 100
            let sma100 = null;
            if (index >= 99) {
                const slice = array.slice(index - 99, index + 1);
                sma100 = slice.reduce((sum, r) => sum + r.close, 0) / 100;
            }

            // Daily Return
            let daily_return = 0;
            if (index > 0) {
                daily_return = (record.close - array[index - 1].close) / array[index - 1].close;
            }

            // Volatility (20 day std dev of returns)
            let volatility = null;
            if (index >= 20) {
                // We need returns for previous 20 days
                const returns = [];
                for (let j = 0; j < 20; j++) {
                    const prev = array[index - j];
                    const prevPrev = array[index - j - 1];
                    if (prevPrev) {
                        returns.push((prev.close - prevPrev.close) / prevPrev.close);
                    }
                }
                if (returns.length > 0) {
                    const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
                    const variance = returns.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / returns.length;
                    volatility = Math.sqrt(variance);
                }
            }

            return {
                ...record,
                sma20: sma20 ? parseFloat(sma20.toFixed(2)) : null,
                sma50: sma50 ? parseFloat(sma50.toFixed(2)) : null,
                sma100: sma100 ? parseFloat(sma100.toFixed(2)) : null,
                daily_return: parseFloat(daily_return.toFixed(4)),
                volatility: volatility ? parseFloat(volatility.toFixed(4)) : null
            };
        });

        data[ticker] = processed;
    });

    // Ensure dir exists
    const dir = path.dirname(OUTPUT_FILE);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(data, null, 2));
    console.log(`Data generated at ${OUTPUT_FILE}`);
}

generateData();
