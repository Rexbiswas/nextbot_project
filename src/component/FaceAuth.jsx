import { useState, useEffect, useRef } from 'react'
import * as faceapi from 'face-api.js'
import { useAuth } from '../contexts/AuthContext'
import { AlertCircle, UserCheck, Loader } from 'lucide-react'

const FaceAuth = ({ onAuthenticated, mode = 'login' }) => {
    const [isLoading, setIsLoading] = useState(true)
    const [status, setStatus] = useState('Loading AI Models...')
    const [error, setError] = useState(null)
    const videoRef = useRef(null)
    const canvasRef = useRef(null)
    const { verifyFace, registerFace, getCurrentUser } = useAuth()
    const streamRef = useRef(null)
    const intervalRef = useRef(null)

    // Load Models on Mount
    useEffect(() => {
        const loadModels = async () => {
            const LOCAL_URL = '/models/';
            const CDN_URL = 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/';

            const tryLoad = async (url, sourceName) => {
                console.log(`[Nextbot Vision] Attempting to load models from ${sourceName}: ${url}`);
                await faceapi.nets.tinyFaceDetector.loadFromUri(url);
                await faceapi.nets.faceLandmark68Net.loadFromUri(url);
                await faceapi.nets.faceRecognitionNet.loadFromUri(url);
                return true;
            };

            try {
                // First attempt: Local files
                await tryLoad(LOCAL_URL, "Local Repository");
                setStatus('Sensory Matrix Loaded (Local). Calibrating...');
                startVideo();
            } catch (localError) {
                console.warn("[Nextbot Vision] Local models corrupted or missing. Activating CDN Fallback...", localError);
                try {
                    // Second attempt: Global CDN
                    await tryLoad(CDN_URL, "Global CDN");
                    setStatus('Sensory Matrix Loaded (CDN). Calibrating...');
                    startVideo();
                } catch (cdnError) {
                    console.error("[Nextbot Vision Critical]: All model sources failed.", cdnError);
                    setError(`Failed to load Face AI models. Please check your internet connection or ensure 'public/models' contains valid files.`);
                    setIsLoading(false);
                }
            }
        }
        loadModels()

        return () => stopVideo()
    }, [])

    const startVideo = () => {
        navigator.mediaDevices.getUserMedia({ video: {} })
            .then(stream => {
                streamRef.current = stream
                if (videoRef.current) {
                    videoRef.current.srcObject = stream
                }
            })
            .catch(err => {
                console.error("Video Error:", err)
                setError('Camera access denied.')
            })
    }

    const stopVideo = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(t => t.stop())
        }
        if (intervalRef.current) clearInterval(intervalRef.current)
    }

    const handleVideoPlay = () => {
        setIsLoading(false);
        setStatus('Ready');

        intervalRef.current = setInterval(async () => {
            if (!videoRef.current || !canvasRef.current) return;

            // 1. Lightweight Detection (Just check if face is there)
            const detections = await faceapi.detectAllFaces(
                videoRef.current,
                new faceapi.TinyFaceDetectorOptions()
            );

            // 2. Fast UI Feedback
            const canvas = canvasRef.current;
            const displaySize = { width: videoRef.current.videoWidth, height: videoRef.current.videoHeight };
            faceapi.matchDimensions(canvas, displaySize);
            const resizedDetections = faceapi.resizeResults(detections, displaySize);
            canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
            faceapi.draw.drawDetections(canvas, resizedDetections);

            if (detections.length > 0) {
                setStatus('Processing Face...');
                
                // 3. Conditional High-Performance Processing
                const fullDetections = await faceapi.detectAllFaces(
                    videoRef.current, 
                    new faceapi.TinyFaceDetectorOptions()
                ).withFaceLandmarks().withFaceDescriptors();

                if (fullDetections.length > 0) {
                    const descriptor = fullDetections[0].descriptor;

                    if (mode === 'login') {
                        const result = await verifyFace(descriptor);
                        if (result.success) {
                            setStatus('Access Granted!');
                            stopVideo();
                            onAuthenticated && onAuthenticated();
                        } else {
                            setStatus('Unauthorized. Retrying...');
                        }
                    } else if (mode === 'register') {
                        setStatus('Face Aligned. Ready to Register.');
                    }
                }
            } else {
                setStatus('Scanning...');
            }
        }, 150);
    }

    const handleRegisterClick = async () => {
        if (!videoRef.current) return
        const detections = await faceapi.detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceDescriptor()

        if (detections) {
            const user = getCurrentUser()
            if (user) {
                registerFace(user.username, detections.descriptor)
                setStatus('Face Registered Successfully!')
                setTimeout(() => onAuthenticated && onAuthenticated(), 1000)
            }
        }
    }

    return (
        <div className="relative w-full max-w-sm mx-auto overflow-hidden rounded-xl border border-cyan-500/30 bg-black/50 backdrop-blur-md shadow-[0_0_30px_rgba(6,182,212,0.2)]">
            <div className="relative aspect-video bg-black">
                <video
                    ref={videoRef}
                    autoPlay
                    muted
                    onPlay={handleVideoPlay}
                    className="absolute inset-0 w-full h-full object-cover"
                />
                <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

                {/* Overlay UI */}
                <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-10">
                    <div className="text-xs font-[Orbitron] text-cyan-400 bg-black/60 px-2 py-1 rounded border border-cyan-500/30">
                        {status}
                    </div>
                </div>

                {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-20">
                        <Loader className="w-8 h-8 text-cyan-500 animate-spin" />
                    </div>
                )}

                {error && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 z-20 text-red-500 text-center p-4">
                        <AlertCircle className="w-8 h-8 mb-2" />
                        <p className="text-sm">{error}</p>
                    </div>
                )}
            </div>

            {mode === 'register' && !isLoading && !error && (
                <div className="p-4 flex justify-center border-t border-cyan-500/20">
                    <button
                        onClick={handleRegisterClick}
                        className="bg-cyan-500/20 hover:bg-cyan-500/40 text-cyan-300 px-6 py-2 rounded-full font-[Orbitron] text-sm tracking-wider flex items-center gap-2 transition-all"
                    >
                        <UserCheck size={16} /> REGISTER CURRENT FACE
                    </button>
                </div>
            )}
        </div>
    )
}

export default FaceAuth
