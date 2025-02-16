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
        parameters: z.object({
            symbol: z.string(),
        }),
        execute: async ({ symbol }: { symbol: string }) => {
            const response = await fetch(
                `${BASE_URL}/api/v1/binance/income?api_key=${API_KEY}&symbol=${symbol}`
            );

            const result = await response.json();

            console.log({ result });

            return JSON.stringify(result);

            // const { text } = await generateText({
            //     model: google('gemini-2.0-flash-exp'),
            //     prompt: `This is trade history in JSON format. Make sure to convert it into readable format (list) and use emojis for the gain and loss. Return only the list of results. Do not add explanation <json>${JSON.stringify(
            //         result
            //     )}<json>.`,
            //     temperature: 0,
            //     maxTokens: 1000,
            // });

            // return text;
        },
    },
};

export default BinanceService;
