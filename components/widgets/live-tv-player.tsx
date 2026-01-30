"use client";

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { RotateCcw, Loader2, AlertTriangle } from 'lucide-react';
import Hls from 'hls.js';
import { ErrorBoundary } from "react-error-boundary";
// import { env } from '@/lib/config/env';

interface HlsError {
    type: string;
    details: string;
    fatal: boolean;
    buffer?: number;
}

const LiveTvPlayer: React.FC = () => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const hlsRef = useRef<Hls | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [retryCount, setRetryCount] = useState(0);
    const maxRetries = 3;
    const retryTimeoutRef = useRef<NodeJS.Timeout>(undefined);

    // Clean up HLS instance and timeouts
    const cleanupHls = useCallback(() => {
        if (hlsRef.current) {
            hlsRef.current.destroy();
            hlsRef.current = null;
        }
        if (retryTimeoutRef.current) {
            clearTimeout(retryTimeoutRef.current);
        }
    }, []);

    // Handle HLS errors
    const handleHlsError = useCallback((event: string, data: HlsError) => {
        if (!data.fatal) return;

        const video = videoRef.current;
        if (!video) return;

        switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
                setError('Network error. Reconnecting...');
                hlsRef.current?.startLoad();
                break;
            case Hls.ErrorTypes.MEDIA_ERROR:
                setError('Media error. Attempting recovery...');
                hlsRef.current?.recoverMediaError();
                break;
            default:
                setError('Stream unavailable. Please try again later.');
                cleanupHls();
                break;
        }
    }, [cleanupHls]);

    // Initialize HLS player
    const initHls = useCallback(() => {
        const video = videoRef.current;
        if (!video) return;

        cleanupHls();

        const hls = new Hls({
            // Buffering strategy tuned for live streams
            lowLatencyMode: true,
            liveSyncDurationCount: 3, // stay ~3 segments behind live edge
            maxLiveSyncPlaybackRate: 1.5,
            backBufferLength: 30,
            maxBufferLength: 10, // keep buffer small for live to reduce latency
            maxMaxBufferLength: 20,
            maxBufferSize: 40 * 1000 * 1000, // 40MB
            maxBufferHole: 0.5,
            progressive: true,
            enableWorker: true,
            // Timeouts
            manifestLoadingTimeOut: 8000,
            levelLoadingTimeOut: 8000,
            fragLoadingTimeOut: 8000,
            // ABR
            startLevel: -1, // Auto-select
            abrMaxWithRealBitrate: true,
            capLevelToPlayerSize: true,
        });

        hlsRef.current = hls;

        hls.on(Hls.Events.ERROR, handleHlsError);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
            setIsLoading(false);
            setError(null);
        });
        // Clear error on first media attached/level switch
        hls.on(Hls.Events.LEVEL_SWITCHED, () => setError(null));

        // Network-aware initial cap: on slow networks prefer lower level to avoid stalls
        const effectiveType = (navigator as any)?.connection?.effectiveType as
            | 'slow-2g'
            | '2g'
            | '3g'
            | '4g'
            | undefined;
        if (effectiveType && ['slow-2g', '2g', '3g'].includes(effectiveType)) {
            // Defer until levels are loaded
            hls.once(Hls.Events.MANIFEST_PARSED, () => {
                const minAuto = hls.minAutoLevel;
                const cap = Math.max(minAuto, 1); // cap to a low-but-watchable level
                hls.autoLevelCapping = cap;
            });
        }

        if (process.env.NEXT_PUBLIC_LIVE_TV_URL) {
            hls.loadSource(process.env.NEXT_PUBLIC_LIVE_TV_URL);
            hls.attachMedia(video);
        }

        return hls;
    }, [cleanupHls, handleHlsError]);

    // Load stream with retry logic
    const loadStream = useCallback(() => {
        if (retryCount >= maxRetries) {
            setError('Maximum retry attempts reached. Please refresh the page.');
            return;
        }

        setIsLoading(true);
        setError(null);
        const streamUrl = process.env.NEXT_PUBLIC_LIVE_TV_URL;

        if (!streamUrl) {
            setError('Live TV stream URL is not configured.');
            setIsLoading(false);
            return;
        }

        try {
            if (Hls.isSupported()) {
                initHls();
            } else if (videoRef.current?.canPlayType('application/vnd.apple.mpegurl')) {
                // For Safari
                const video = videoRef.current;
                video.src = streamUrl;
                video.onloadeddata = () => setIsLoading(false);
                video.onerror = () => setError('Failed to load stream');
            } else {
                throw new Error('HLS is not supported in this browser');
            }
        } catch (err) {
            setError('Failed to initialize player');
            const attempt = retryCount + 1;
            const backoff = Math.min(15000, 2000 * Math.pow(2, attempt));
            retryTimeoutRef.current = setTimeout(() => {
                setRetryCount((prev) => prev + 1);
            }, backoff);
        }
    }, [initHls, retryCount]);

    // Handle fullscreen changes
    const handleFullscreenChange = useCallback(() => {
        setIsFullscreen(!!document.fullscreenElement);
    }, []);

    // Effects
    useEffect(() => {
        loadStream();

        // Add fullscreen change event listeners
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
        document.addEventListener('msfullscreenchange', handleFullscreenChange);

        // Video stall recovery via DOM events
        const videoEl = videoRef.current;
        const onVideoStall = () => {
            const v = videoRef.current;
            const hls = hlsRef.current;
            if (hls) {
                try {
                    hls.startLoad();
                } catch { }
            }
            if (v && v.readyState < 3) {
                v.play().catch(() => { });
            }
        };
        if (videoEl) {
            videoEl.addEventListener('waiting', onVideoStall);
            videoEl.addEventListener('stalled', onVideoStall);
            videoEl.addEventListener('suspend', onVideoStall);
        }

        // Watchdog: if playback stalls with little buffer, try reducing level and restart loading
        const watchdog = setInterval(() => {
            const v = videoRef.current;
            const hls = hlsRef.current;
            if (!v || !hls) return;
            const currentTime = v.currentTime;
            const buffered = v.buffered;
            let ahead = 0;
            for (let i = 0; i < buffered.length; i++) {
                if (buffered.start(i) <= currentTime && buffered.end(i) >= currentTime) {
                    ahead = buffered.end(i) - currentTime;
                    break;
                }
            }
            // If we have less than 1.5s buffer and playback is not progressing, lower quality and nudge
            if (ahead < 1.5) {
                if (hls.autoLevelEnabled) {
                    const newCap = Math.max(hls.minAutoLevel, hls.nextAutoLevel - 1);
                    hls.autoLevelCapping = newCap;
                }
                try {
                    hls.startLoad();
                    v.play().catch(() => { });
                } catch { }
            }
        }, 3000);

        // Pause/reduce activity when tab hidden to avoid unnecessary buffering
        const onVisibility = () => {
            const hls = hlsRef.current;
            if (!hls) return;
            if (document.hidden) {
                hls.stopLoad();
            } else {
                hls.startLoad();
            }
        };
        document.addEventListener('visibilitychange', onVisibility);

        return () => {
            cleanupHls();
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
            document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
            document.removeEventListener('msfullscreenchange', handleFullscreenChange);
            document.removeEventListener('visibilitychange', onVisibility);
            if (videoEl) {
                videoEl.removeEventListener('waiting', onVideoStall);
                videoEl.removeEventListener('stalled', onVideoStall);
                videoEl.removeEventListener('suspend', onVideoStall);
            }
            clearInterval(watchdog);
        };
    }, [loadStream, cleanupHls, handleFullscreenChange]);

    // Handle retry
    const handleRetry = useCallback(() => {
        setRetryCount(0);
        loadStream();
    }, [loadStream]);

    return (
        <div className="relative w-full aspect-video bg-black rounded-sm overflow-hidden group">
            <video
                ref={videoRef}
                className="w-full h-full object-cover"
                controls
                muted
                autoPlay
                playsInline
                aria-label="Live TV Stream"
                aria-busy={isLoading}
                aria-live="polite"
            />

            {/* Live Indicator */}
            {/* <div className="absolute top-4 right-4 z-20 flex items-center gap-2 pointer-events-none fade-in-0 duration-300">
                <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600"></span>
                </span>
                <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider shadow-sm">
                    Live
                </span>
            </div> */}

            {/* Loading Overlay */}
            {isLoading && !error && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/70 z-10">
                    <div className="flex flex-col items-center">
                        <Loader2 className="h-8 w-8 text-white animate-spin" />
                        <span className="mt-2 text-white text-sm font-medium">Loading Live Stream...</span>
                    </div>
                </div>
            )}

            {/* Error Overlay */}
            {error && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 z-20 p-6 text-center">
                    <p className="text-white font-medium mb-4">{error}</p>
                    {retryCount < maxRetries && (
                        <button
                            onClick={handleRetry}
                            className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm font-medium"
                            aria-label="Retry loading stream"
                        >
                            <RotateCcw className="mr-2 h-4 w-4" />
                            Retry Connection
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

const LiveTvPlayerErrorBoundary = () => {
    return (
        <ErrorBoundary
            fallback={
                <div className="w-full aspect-video bg-black rounded-lg flex flex-col items-center justify-center text-white p-4">
                    <AlertTriangle className="h-8 w-8 text-red-500 mb-2" />
                    <p className="text-sm font-medium">Live Stream Temporarily Unavailable</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-4 px-4 py-2 bg-white/10 hover:bg-white/20 rounded text-xs transition-colors"
                    >
                        Reload Page
                    </button>
                </div>
            }
        >
            <LiveTvPlayer />
        </ErrorBoundary>
    );
};

export default React.memo(LiveTvPlayerErrorBoundary);
