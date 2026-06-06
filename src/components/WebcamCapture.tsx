import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Camera, RefreshCcw } from "lucide-react";

interface WebcamCaptureProps {
  onCapture: (base64Image: string) => void;
}

export function WebcamCapture({ onCapture }: WebcamCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const startWebcam = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setError(null);
    } catch (err) {
      console.error("Error accessing webcam:", err);
      setError("Could not access webcam. Please ensure permissions are granted.");
    }
  };

  useEffect(() => {
    startWebcam();
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const handleCapture = () => {
    if (videoRef.current) {
      const canvas = document.createElement("canvas");
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL("image/jpeg");
        setCapturedImage(dataUrl);
        onCapture(dataUrl);
        // Stop stream after capture
        if (stream) {
          stream.getTracks().forEach((track) => track.stop());
          setStream(null);
        }
      }
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
    onCapture("");
    startWebcam();
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-6 bg-muted/50 rounded-lg border border-dashed h-[300px]">
        <Camera className="w-12 h-12 text-muted-foreground mb-4 opacity-50" />
        <p className="text-sm text-center text-muted-foreground">{error}</p>
        <Button onClick={startWebcam} variant="outline" className="mt-4">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative w-full max-w-sm aspect-[4/3] bg-black rounded-lg overflow-hidden border">
        {capturedImage ? (
          <img
            src={capturedImage}
            alt="Captured selfie"
            className="w-full h-full object-cover"
          />
        ) : (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
        )}
      </div>

      {!capturedImage ? (
        <Button onClick={handleCapture} className="w-full max-w-sm" size="lg">
          <Camera className="mr-2 h-5 w-5" />
          Capture Selfie
        </Button>
      ) : (
        <Button onClick={handleRetake} variant="outline" className="w-full max-w-sm" size="lg">
          <RefreshCcw className="mr-2 h-5 w-5" />
          Retake Photo
        </Button>
      )}
    </div>
  );
}
