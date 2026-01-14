import { ReactNode } from 'react';

export type MessageTone = 'info' | 'success' | 'error' | 'warn';

type MessageBoxProps = {
    tone?: MessageTone;
    children?: ReactNode;
};

export default function MessageBox({ tone = 'info', children }: MessageBoxProps) {
    if (!children) return null;
    return <div className={`message message--${tone}`}>{children}</div>;
}
