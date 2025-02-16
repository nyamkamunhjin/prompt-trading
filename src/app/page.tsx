/* eslint-disable react/no-unescaped-entities */
'use client';

import type React from 'react';

import { useState } from 'react';
import { useChat } from '@ai-sdk/react';
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { UIMessage } from 'ai';

export default function ChatInterface() {
    const {
        messages,
        input,
        handleInputChange,
        handleSubmit,
        isLoading,
        addToolResult,
        error,
    } = useChat({
        maxSteps: 5,
        // onToolCall: async ({ toolCall }) => {
        //     if (toolCall.toolName === 'getBalance') {
        //         const cities = [
        //             'New York',
        //             'Los Angeles',
        //             'Chicago',
        //             'San Francisco',
        //         ];
        //         return cities[Math.floor(Math.random() * cities.length)];
        //     }
        // },
    });

    const [showWelcomeMessage, setShowWelcomeMessage] = useState(true);

    const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (showWelcomeMessage) setShowWelcomeMessage(false);
        handleSubmit(e);
    };

    const renderMessage = (message: UIMessage) => {
        if (message.role === 'user') {
            return <p className="text-sm">{message.content}</p>;
        }

        if (message.role === 'assistant') {
            return (
                <>
                    {message.parts.map((part) => {
                        switch (part.type) {
                            // render text parts as simple text:
                            case 'text':
                                return part.text;

                            // for tool invocations, distinguish between the tools and the state:
                            case 'tool-invocation': {
                                const toolCallId =
                                    part.toolInvocation.toolCallId;

                                switch (part.toolInvocation.state) {
                                    // example of pre-rendering streaming tool calls:
                                    case 'partial-call':
                                        return (
                                            <pre key={toolCallId}>
                                                {JSON.stringify(
                                                    part.toolInvocation,
                                                    null,
                                                    2
                                                )}
                                            </pre>
                                        );
                                    case 'call':
                                        return (
                                            <div
                                                key={toolCallId}
                                                className="text-gray-500"
                                            >
                                                Calling tool{' '}
                                                {part.toolInvocation.toolName}
                                                ...
                                            </div>
                                        );
                                    case 'result':
                                        return (
                                            <div
                                                key={toolCallId}
                                                className="text-gray-500"
                                            >
                                                Result:{' '}
                                                {part.toolInvocation.result}
                                            </div>
                                        );
                                }
                            }
                        }
                    })}
                </>
            );
        }

        return null;
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
            <Card className="w-full max-w-2xl">
                <CardHeader>
                    <CardTitle>AI Agent with Tools</CardTitle>
                </CardHeader>
                <CardContent>
                    <ScrollArea className="h-[60vh] pr-4">
                        {showWelcomeMessage && (
                            <div className="flex items-start space-x-4 mb-4">
                                <Avatar>
                                    <AvatarImage
                                        src="/placeholder.svg?height=40&width=40"
                                        alt="AI"
                                    />
                                    <AvatarFallback>AI</AvatarFallback>
                                </Avatar>
                                <div className="bg-primary/10 rounded-lg p-4">
                                    <p className="text-sm">
                                        Hello! I'm your AI assistant with access
                                        to tools. I can help you with weather
                                        information and current time for
                                        different locations. How can I assist
                                        you today?
                                    </p>
                                </div>
                            </div>
                        )}
                        {messages.map((message) => (
                            <div
                                key={message.id}
                                className="flex items-start space-x-4 mb-4"
                            >
                                <Avatar>
                                    <AvatarImage
                                        src={
                                            message.role === 'user'
                                                ? '/placeholder.svg?height=40&width=40'
                                                : '/placeholder.svg?height=40&width=40'
                                        }
                                        alt={
                                            message.role === 'user'
                                                ? 'User'
                                                : 'AI'
                                        }
                                    />
                                    <AvatarFallback>
                                        {message.role === 'user' ? 'U' : 'AI'}
                                    </AvatarFallback>
                                </Avatar>
                                <div
                                    className={`rounded-lg p-4 ${
                                        message.role === 'user'
                                            ? 'bg-primary text-primary-foreground'
                                            : 'bg-muted'
                                    }`}
                                >
                                    {renderMessage(message)}
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex items-center space-x-2">
                                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-primary"></div>
                                <p className="text-sm text-muted-foreground">
                                    AI is thinking...
                                </p>
                            </div>
                        )}
                        {error && (
                            <div className="text-red-500 text-sm mt-2">
                                Error: {error.message}
                            </div>
                        )}
                    </ScrollArea>
                </CardContent>
                <CardFooter>
                    <form onSubmit={onSubmit} className="flex w-full space-x-2">
                        <Input
                            value={input}
                            onChange={handleInputChange}
                            placeholder="Type your message here..."
                            className="flex-grow"
                        />
                        <Button type="submit" disabled={isLoading}>
                            Send
                        </Button>
                    </form>
                </CardFooter>
            </Card>
        </div>
    );
}
