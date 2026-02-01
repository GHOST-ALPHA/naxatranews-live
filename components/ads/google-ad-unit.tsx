"use client";

import { useEffect, useRef } from 'react';

type AdUnitProps = {
    slot: string;
    format?: 'auto' | 'fluid' | 'rectangle';
    layout?: string;
    responsive?: boolean;
    className?: string;
    style?: React.CSSProperties;
};

export const GoogleAdUnit = ({
    slot,
    format = 'auto',
    layout,
    responsive = true,
    className = '',
    style = { display: 'block' },
}: AdUnitProps) => {
    const adRef = useRef<HTMLModElement>(null);
    const initializedRef = useRef(false);

    useEffect(() => {
        // Prevent double initialization in React Strict Mode
        if (initializedRef.current) return;

        // Check if the ad slot is already filled to avoid "adsbygoogle.push() error: No slot size for availableWidth=0"
        if (adRef.current?.innerHTML) return;

        try {
            if (typeof window !== 'undefined') {
                (window as any).adsbygoogle = (window as any).adsbygoogle || [];
                (window as any).adsbygoogle.push({});
                initializedRef.current = true;
            }
        } catch (err) {
            if (process.env.NODE_ENV === 'development') {
                console.error('AdSense error:', err);
            }
        }
    }, []);

    return (
        <div className={`ad-container ${className} my-4 overflow-hidden`}>
            <ins
                className="adsbygoogle"
                style={style}
                data-ad-client={process.env.NEXT_PUBLIC_ADSENSE_CLIENT}
                data-ad-slot={slot}
                data-ad-format={format}
                data-full-width-responsive={responsive}
                data-ad-layout={layout}
            />
        </div>
    );
};
