// api/chat/route.ts
import { streamText } from 'ai';
import { google } from '@ai-sdk/google';
import BinanceService from '../../../../service/binance';

export const runtime = 'edge';

export async function POST(req: Request) {
    const tools = {
        getBalance: BinanceService.getBalance,
        getTradeHistory: BinanceService.getTradeHistory,
        entry: BinanceService.entry,
    };

    const { messages } = await req.json();
    const result = streamText({
        model: google('gemini-2.0-flash-exp'),
        messages,
        temperature: 0.7,
        maxTokens: 1000,
        tools,
    });

    return result.toDataStreamResponse();
}
