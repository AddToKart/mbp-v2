"use client";

import { useState, useRef } from "react";
import { RegisterStep2Schema, type RegisterStep2Request } from "@/types/shared";
import Tesseract from "tesseract.js";

interface RegisterStep2Props {
    onNext: (data: RegisterStep2Request) => void;
    onBack: () => void;
}

export default function RegisterStep2({ onNext, onBack }: RegisterStep2Props) {
    const [frontImage, setFrontImage] = useState<string | null>(null);
    const [backImage, setBackImage] = useState<string | null>(null);
    const [ocrText, setOcrText] = useState<string>("");
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const processImage = async (imageSrc: string) => {
        setIsProcessing(true);
        setOcrText("Scanning ID...");
        try {
            const result = await Tesseract.recognize(imageSrc, 'eng', {
                logger: (m) => console.log(m),
            });
            setOcrText((prev) => prev + "\n" + result.data.text);
        } catch (err) {
            console.error("OCR Error:", err);
            // Don't block flow on OCR error, just log it
        } finally {
            setIsProcessing(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, side: "front" | "back") => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) { // 5MB limit
                setError("File size too large. Max 5MB.");
                return;
            }

            const reader = new FileReader();
            reader.onloadend = () => {
                const result = reader.result as string;
                if (side === "front") {
                    setFrontImage(result);
                    processImage(result); // Trigger OCR on front ID
                } else {
                    setBackImage(result);
                }
                setError(null);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async () => {
        if (!frontImage || !backImage) {
            setError("Please upload both front and back of your ID.");
            return;
        }

        try {
            const validData = RegisterStep2Schema.parse({
                idCardFront: frontImage,
                idCardBack: backImage,
            });
            onNext(validData);
        } catch (err) {
            setError("Invalid image data.");
        }
    };

    return (
        <div className="space-y-6">
            <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900">ID Verification</h2>
                <p className="mt-2 text-sm text-gray-600">
                    Upload a clear photo of your Barangay ID (Front and Back).
                </p>
            </div>

            <div className="space-y-4">
                {/* Front ID */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:bg-gray-50 transition-colors">
                    <label className="cursor-pointer block">
                        <span className="block font-medium text-gray-700 mb-2">Front of ID</span>
                        {frontImage ? (
                            <img src={frontImage} alt="ID Front" className="mx-auto h-48 object-contain rounded-md" />
                        ) : (
                            <div className="py-10 text-gray-400">
                                <p>Click to upload or drag and drop</p>
                                <p className="text-xs">PNG, JPG up to 5MB</p>
                            </div>
                        )}
                        <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleFileChange(e, "front")}
                        />
                    </label>
                </div>

                {/* Back ID */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:bg-gray-50 transition-colors">
                    <label className="cursor-pointer block">
                        <span className="block font-medium text-gray-700 mb-2">Back of ID</span>
                        {backImage ? (
                            <img src={backImage} alt="ID Back" className="mx-auto h-48 object-contain rounded-md" />
                        ) : (
                            <div className="py-10 text-gray-400">
                                <p>Click to upload or drag and drop</p>
                                <p className="text-xs">PNG, JPG up to 5MB</p>
                            </div>
                        )}
                        <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleFileChange(e, "back")}
                        />
                    </label>
                </div>
            </div>

            {isProcessing && (
                <div className="bg-blue-50 p-3 rounded-md text-sm text-blue-700 flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Scanning ID details...
                </div>
            )}

            {error && <p className="text-sm text-center text-red-600">{error}</p>}

            <div className="flex gap-4">
                <button
                    type="button"
                    onClick={onBack}
                    className="w-full py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                >
                    Back
                </button>
                <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={!frontImage || !backImage || isProcessing}
                    className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isProcessing ? "Processing..." : "Next: Face Verification"}
                </button>
            </div>
        </div>
    );
}
