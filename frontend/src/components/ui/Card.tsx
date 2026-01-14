import { ReactNode } from 'react';

type CardProps = {
    title: string;
    children: ReactNode;
    footer?: ReactNode;
};

export default function Card({ title, children, footer }: CardProps) {
    return (
        <section className="card">
            <div className="card__header">
                <h2>{title}</h2>
            </div>
            <div className="card__body">{children}</div>
            {footer && <div className="card__footer">{footer}</div>}
        </section>
    );
}
