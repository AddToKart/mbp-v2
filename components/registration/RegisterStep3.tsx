"use client";

import { useState, useRef, useEffect } from "react";
import * as faceapi from "face-api.js";
import { RegisterStep3Schema, type RegisterStep3Request } from "@/types/shared";

interface RegisterStep3Props {
    onNext: (data: RegisterStep3Request) => void;
    onBack: () => void;
}

export default function RegisterStep3({ onNext, onBack }: RegisterStep3Props) {
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const [isModelLoading, setIsModelLoading] = useState(true);
    const [detectionStatus, setDetectionStatus] = useState<string>("Initializing AI...");
    const [analysisResult, setAnalysisResult] = useState<any>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const streamRef = useRef<MediaStream | null>(null);

    // Load models on mount
    useEffect(() => {
        const loadModels = async () => {
            try {
                const MODEL_URL = "/models"; // We need to ensure these files exist in public/models
                // Using reduced models for speed
                await Promise.all([
                    faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
                    // faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
                    // faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
                ]);
                setIsModelLoading(false);
                setDetectionStatus("Ready. Please look at the camera.");
                startCamera();
            } catch (err) {
                console.error("Failed to load models:", err);
                setDetectionStatus("AI Model Error (skipping verification for now)");
                setIsModelLoading(false);
                startCamera(); // Allow capture even if AI fails
            }
        };
        loadModels();

        return () => stopCamera();
    }, []);

    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                streamRef.current = stream;
            }
        } catch (err) {
            setDetectionStatus("Camera access denied.");
        }
    };

    const stopCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop());
            streamRef.current = null;
        }
    };

    const startLiveDetection = async () => {
        if (!videoRef.current || !canvasRef.current || isModelLoading) return;

        // basic detection loop could go here if we want real-time bounding boxes
        // For now, we'll just detect on capture to keep it simple
    };

    const capturePhoto = async () => {
        if (!videoRef.current || !canvasRef.current) return;

        const video = videoRef.current;
        const canvas = canvasRef.current;
        const context = canvas.getContext("2d");

        if (context) {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            context.drawImage(video, 0, 0, canvas.width, canvas.height);
            const dataUrl = canvas.toDataURL("image/jpeg");
            setCapturedImage(dataUrl);
            stopCamera();

            // Run detection on captured image
            analyzeFace(video);
        }
    };

    const analyzeFace = async (imageElement: HTMLVideoElement | HTMLImageElement) => {
        setDetectionStatus("Analyzing...");
        try {
            // Use FaceAPI to detect
            const detections = await faceapi.detectSingleFace(imageElement, new faceapi.TinyFaceDetectorOptions());

            if (detections) {
                setDetectionStatus("Face detected! ✅");
                setAnalysisResult({
                    score: detections.score,
                    box: detections.box
                });
            } else {
                setDetectionStatus("No face detected. Please try again.");
            }
        } catch (e) {
            console.error(e);
            setDetectionStatus("Analysis failed. Proceeding...");
        }
    };

    const retake = () => {
        setCapturedImage(null);
        setAnalysisResult(null);
        setDetectionStatus("Ready.");
        startCamera();
    };

    const handleSubmit = () => {
        if (!capturedImage) return;

        // We can simulate liveness check here or pass the analysis
        const result = {
            liveness: "passed (simulated)",
            faceScore: analysisResult?.score || 0
        };

        onNext({
            selfieImage: capturedImage,
            aiAnalysis: JSON.stringify(result)
        });
    };

    return (
        <div className="space-y-6">
            <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900">Face Verification</h2>
                <p className="mt-2 text-sm text-gray-600">
                    Position your face in the frame to verify your identity.
                </p>
            </div>

            <div className="relative mx-auto w-full max-w-sm aspect-[3/4] bg-black rounded-lg overflow-hidden shadow-lg">
                {!capturedImage ? (
                    <video
                        ref={videoRef}
                        autoPlay
                        muted
                        playsInline
                        onPlay={startLiveDetection}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <img src={capturedImage} alt="Capture" className="w-full h-full object-cover" />
                )}

                <canvas ref={canvasRef} className="hidden" />

                {/* Overlay Instructions */}
                <div className="absolute top-4 left-0 right-0 text-center">
                    <span className="inline-block px-3 py-1 bg-black/50 text-white text-sm rounded-full backdrop-blur-sm">
                        {detectionStatus}
                    </span>
                </div>
            </div>

            {isModelLoading && (
                <p className="text-center text-xs text-gray-400">Loading AI Models... (Ensure /public/models exists)</p>
            )}

            <div className="flex gap-4">
                <button
                    type="button"
                    onClick={onBack}
                    className="w-full py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                >
                    Back
                </button>

                {!capturedImage ? (
                    <button
                        type="button"
                        onClick={capturePhoto}
                        disabled={isModelLoading}
                        className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none disabled:opacity-50"
                    >
                        Capture Photo
                    </button>
                ) : (
                    <>
                        <button
                            type="button"
                            onClick={retake}
                            className="w-full py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                        >
                            Retake
                        </button>
                        <button
                            type="button"
                            onClick={handleSubmit}
                            className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none"
                        >
                            Submit
                        </button>
                    </>
                )}

            </div>
        </div>
    );
}
