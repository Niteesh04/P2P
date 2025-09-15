
import React, { useState } from 'react';
import { CopyIcon, CheckIcon } from './icons';
import { Button } from './common/Button';

interface CopyableTextareaProps {
    text: string;
    label: string;
}

export const CopyableTextarea: React.FC<CopyableTextareaProps> = ({ text, label }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">{label}</label>
            <div className="relative">
                <textarea
                    readOnly
                    value={text}
                    className="w-full h-32 p-3 bg-gray-900 border border-gray-700 rounded-md resize-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Generating link..."
                />
                <Button
                    variant="ghost"
                    onClick={handleCopy}
                    className="absolute top-2 right-2 p-2"
                    aria-label="Copy to clipboard"
                    disabled={!text}
                >
                    {copied ? <CheckIcon className="w-5 h-5 text-green-400" /> : <CopyIcon className="w-5 h-5 text-gray-400" />}
                </Button>
            </div>
        </div>
    );
};
