'use client';

import { useEffect, useRef, useState } from 'react';

type NexusTerminalProps = {
    feedbacks: Array<{
        feedbackType: string;
        aiMessage: string;
        actionItem: string;
        logDate: string;
        createdAt: string;
    }>;
};

export default function NexusTerminal({ feedbacks }: NexusTerminalProps) {
    const terminalRef = useRef<HTMLDivElement>(null);
    const [isTyping, setIsTyping] = useState(true);

    useEffect(() => {
        if (terminalRef.current) {
            terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
        }
        const timer = setTimeout(() => setIsTyping(false), 1500);
        return () => clearTimeout(timer);
    }, [feedbacks]);

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'CRITICAL': return 'text-red-400';
            case 'WARNING': return 'text-yellow-400';
            case 'OPTIMIZED': return 'text-green-400';
            default: return 'text-gray-400';
        }
    };

    return (
        <div className="card terminal-card">
            <div className="card-header">
                <div className="flex items-center gap-2">
                    <div className="flex gap-1.5">
                        <span className="w-3 h-3 rounded-full bg-red-500"></span>
                        <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
                        <span className="w-3 h-3 rounded-full bg-green-500"></span>
                    </div>
                    <h3 className="font-mono text-sm">nexus@ramadan:~$</h3>
                </div>
            </div>
            <div ref={terminalRef} className="terminal-body">
                {/* Boot sequence */}
                <p className="terminal-line dim">
                    [NEXUS] Initializing Audit System v3.0...
                </p>
                <p className="terminal-line dim">
                    [NEXUS] Connected to Supabase. Memory loaded.
                </p>
                <p className="terminal-line dim mb-3">
                    {'─'.repeat(50)}
                </p>

                {feedbacks.length === 0 ? (
                    <p className="terminal-line dim">
                        No feedback entries yet. Submit your first daily log.
                    </p>
                ) : (
                    feedbacks.map((fb, i) => (
                        <div key={i} className="mb-4">
                            <p className="terminal-line">
                                <span className="text-gray-500">[{fb.logDate}]</span>{' '}
                                <span className={`font-bold ${getTypeColor(fb.feedbackType)}`}>
                                    [{fb.feedbackType}]
                                </span>
                            </p>
                            <p className="terminal-line text-green-400 mt-1 whitespace-pre-wrap">
                                {fb.aiMessage}
                            </p>
                            {fb.actionItem && (
                                <p className="terminal-line text-cyan-400 mt-1">
                                    {'>'} ACTION: {fb.actionItem}
                                </p>
                            )}
                        </div>
                    ))
                )}

                {isTyping && (
                    <p className="terminal-line text-green-400 animate-pulse">
                        █
                    </p>
                )}
            </div>
        </div>
    );
}
