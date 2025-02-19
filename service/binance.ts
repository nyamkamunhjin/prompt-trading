import { google } from '@ai-sdk/google';
import { generateText } from 'ai';
import { z } from 'zod';

const BASE_URL = process.env.API_URL;
const API_KEY = process.env.API_KEY;

const BinanceService = {
    getBalance: {
        description: 'Get Balance of Binance Account',
        parameters: z.object({}),
        execute: async () => {
            const response = await fetch(
                `${BASE_URL}/api/v1/binance/balance?api_key=${API_KEY}`
            );

            const result = await response.json();

            return `Current balance is $${result.balance}`;
        },
    },
    getTradeHistory: {
        description: 'Get Trade History of Selected Symbol',
        parameters: z.object({}),
        execute: async ({ symbol }: { symbol: string }) => {
            const response = await fetch(
                `${BASE_URL}/api/v1/binance/income?api_key=${API_KEY}&symbol=${symbol}`
            );

            const result = await response.json();

            const { text } = await generateText({
                model: google('gemini-2.0-flash-exp'),
                prompt: `Convert the provided trade history JSON into a clean, readable list. Format each entry as:
                            [Emoji] [Symbol] | [Side] (buy or sell) | [Date] | P/L: $[Amount].xx
                            - Use ✅ for gains (positive profitLoss) and ❌ for losses (negative profitLoss).
                            - Format dates as DD MMM YYYY (e.g., 21 Aug 2023).
                            - Return only the list, no headers, explanations.
                            - Format the text in markdown format for readable, rendering

                            Input JSON:
                            <json>${JSON.stringify(result)}</json>

                        `,
                temperature: 0,
                maxTokens: 10000,
            });

            return text;
        },
    },
    entry: {
        description: 'Buy or Sell to enter trade',
        parameters: z.object({
            symbol: z.string().toUpperCase(),
            side: z.enum(['BUY', 'SELL']),
            risk_amount: z.string(),
            price: z.string(),
            takeprofit_price: z.string(),
            stoploss_price: z.string(),
            action: z.enum(['ENTRY']),
        }),
        execute: async (data) => {
            console.dir({ data }, { depth: null });
            const response = await fetch(
                `${BASE_URL}/api/v1/binance/entry?api_key=${API_KEY}`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(data),
                }
            );

            const result = await response.json();

            console.dir({ result }, { depth: null });

            if (result?.success) {
                const { text } = await generateText({
                    model: google('gemini-2.0-flash-exp'),
                    prompt: `Summarize entry order JSON.

                            Input JSON:
                            <json>${JSON.stringify(result)}</json>

                        `,
                    temperature: 0,
                    maxTokens: 10000,
                });
                return text;
            }

            return `Failed to execute trade`;
        },
    },
};

export default BinanceService;
