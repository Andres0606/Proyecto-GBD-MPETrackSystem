'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as faceapi from 'face-api.js';

interface FaceCaptureProps {
  onCapture: (descriptor: number[], imageBase64: string) => void;
  onCancel: () => void;
}

export default function FaceCapture({ onCapture, onCancel }: FaceCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [status, setStatus] = useState('Cargando modelos de IA...');

  useEffect(() => {
    const loadModels = async () => {
      const MODEL_URL = '/models';
      try {
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        ]);
        setIsModelLoaded(true);
        setStatus('Cámara lista. Ubica tu rostro.');
        startVideo();
      } catch (err) {
        console.error('Error cargando modelos:', err);
        setStatus('Error al cargar modelos. Verifica la carpeta public/models.');
      }
    };
    loadModels();
  }, []);

  const startVideo = () => {
    navigator.mediaDevices.getUserMedia({ video: {} })
      .then(stream => {
        if (videoRef.current) videoRef.current.srcObject = stream;
      })
      .catch(err => {
        console.error('Error cámara:', err);
        setStatus('No se pudo acceder a la cámara.');
      });
  };

  const handleCapture = async () => {
    if (!videoRef.current || !isModelLoaded) return;
    
    setStatus('Analizando rostro...');
    
    const detection = await faceapi.detectSingleFace(
      videoRef.current, 
      new faceapi.TinyFaceDetectorOptions()
    ).withFaceLandmarks().withFaceDescriptor();

    if (!detection) {
      setStatus('No se detectó ningún rostro. Intenta de nuevo.');
      return;
    }

    // Verificación de seguridad extra tras el await
    if (!videoRef.current) {
      setStatus('Error de conexión con la cámara. Reintentando...');
      return;
    }

    // Capturar frame del video como base64
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext('2d')?.drawImage(videoRef.current, 0, 0);
    const imageBase64 = canvas.toDataURL('image/jpeg');

    // El descriptor es un Float32Array, lo pasamos a array normal para JSON
    const descriptorArray = Array.from(detection.descriptor);
    
    // Detener cámara
    const stream = videoRef.current.srcObject as MediaStream;
    stream.getTracks().forEach(track => track.stop());

    onCapture(descriptorArray, imageBase64);
  };

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <h3 style={{ marginBottom: '10px', color: '#1a1a1a' }}>Escaneo Facial</h3>
        <p style={{ fontSize: '14px', color: '#666', marginBottom: '15px' }}>{status}</p>
        
        <div style={videoContainerStyle}>
          <video ref={videoRef} autoPlay muted style={videoStyle} />
          <div style={scanOverlayStyle} />
        </div>

        <div style={actionsStyle}>
          <button onClick={onCancel} style={cancelBtnStyle}>Cancelar</button>
          <button onClick={handleCapture} disabled={!isModelLoaded} style={captureBtnStyle}>
            Capturar Rostro
          </button>
        </div>
      </div>
    </div>
  );
}

// Estilos rápidos en línea (puedes moverlos a CSS después)
const containerStyle: React.CSSProperties = {
  position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
  backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
};
const cardStyle: React.CSSProperties = {
  backgroundColor: 'white', padding: '20px', borderRadius: '15px', width: '90%', maxWidth: '400px', textAlign: 'center'
};
const videoContainerStyle: React.CSSProperties = {
  position: 'relative', width: '100%', height: '300px', backgroundColor: '#000', borderRadius: '10px', overflow: 'hidden'
};
const videoStyle: React.CSSProperties = { width: '100%', height: '100%', objectFit: 'cover' };
const scanOverlayStyle: React.CSSProperties = {
  position: 'absolute', top: '10%', left: '10%', width: '80%', height: '80%',
  border: '2px solid #0070f3', borderRadius: '50%', boxShadow: '0 0 0 9999px rgba(0,0,0,0.5)'
};
const actionsStyle: React.CSSProperties = { display: 'flex', gap: '10px', marginTop: '20px' };
const captureBtnStyle: React.CSSProperties = {
  flex: 1, padding: '12px', backgroundColor: '#0070f3', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer'
};
const cancelBtnStyle: React.CSSProperties = {
  padding: '12px', backgroundColor: '#eee', color: '#333', border: 'none', borderRadius: '8px', cursor: 'pointer'
};
