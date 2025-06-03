'use client';
import React, { useRef, useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useParams } from 'next/navigation';

const Webcam = dynamic<any>(() => import('react-webcam').then(mod => mod.default), { ssr: false });

function dataURLtoFile(dataurl: string, filename: string) {
  const arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)?.[1], bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
  for (let i = 0; i < n; i++) u8arr[i] = bstr.charCodeAt(i);
  return new File([u8arr], filename, { type: mime });
}

interface Photo {
  id: number;
  url: string;
  message: string;
  createdAt: string;
}

export default function CoupleMomentsPage() {
  const params = useParams();
  const coupleName = params?.coupleName as string;
  const [photo, setPhoto] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [mode, setMode] = useState<'camera' | 'upload'>('camera');
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [gallery, setGallery] = useState<Photo[]>([]);
  const [loadingGallery, setLoadingGallery] = useState(false);
  const webcamRef = useRef<any>(null);

  const fetchGallery = async () => {
    setLoadingGallery(true);
    try {
      const res = await fetch(`/moments/${coupleName}/gallery`);
      const data = await res.json();
      setGallery(data.photos || []);
    } catch {
      setGallery([]);
    } finally {
      setLoadingGallery(false);
    }
  };

  useEffect(() => {
    if (coupleName) fetchGallery();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coupleName]);

  const capture = () => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      setPhoto(imageSrc);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPhoto(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!photo || !message) return;
    setUploading(true);
    setSuccess(false);
    try {
      let file: File;
      if (photo.startsWith('data:')) {
        file = dataURLtoFile(photo, 'photo.jpg');
      } else {
        // Should not happen, but fallback
        file = new File([photo], 'photo.jpg');
      }
      const formData = new FormData();
      formData.append('photo', file);
      formData.append('message', message);
      const res = await fetch(`/moments/${coupleName}/upload`, {
        method: 'POST',
        body: formData,
      });
      if (res.ok) {
        setSuccess(true);
        setPhoto(null);
        setMessage('');
        fetchGallery();
      } else {
        alert('Upload failed!');
      }
    } catch (err) {
      alert('Upload error!');
    } finally {
      setUploading(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-start p-4 bg-gray-50">
      <h1 className="text-2xl font-bold mb-2">Share a Memory for {coupleName}</h1>
      <div className="w-full max-w-md bg-white rounded-lg shadow p-4 mb-4">
        <div className="flex justify-center mb-2">
          <button
            className={`px-3 py-1 rounded-l ${mode === 'camera' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            onClick={() => setMode('camera')}
          >
            Camera
          </button>
          <button
            className={`px-3 py-1 rounded-r ${mode === 'upload' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            onClick={() => setMode('upload')}
          >
            Upload
          </button>
        </div>
        {photo ? (
          <div className="flex flex-col items-center">
            <img src={photo} alt="Preview" className="w-full rounded mb-2" />
            <button className="text-sm text-red-500 mb-2" onClick={() => setPhoto(null)}>
              Remove
            </button>
          </div>
        ) : mode === 'camera' ? (
          <div className="flex flex-col items-center">
            <Webcam
              audio={false}
              ref={(node: any) => { webcamRef.current = node; }}
              screenshotFormat="image/jpeg"
              className="w-full rounded mb-2"
              videoConstraints={{ facingMode: 'user' }}
            />
            <button
              className="bg-blue-500 text-white px-4 py-2 rounded"
              onClick={capture}
              type="button"
            >
              Take Photo
            </button>
          </div>
        ) : (
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="mb-2"
          />
        )}
        <form onSubmit={handleSubmit} className="flex flex-col gap-2 mt-2">
          <input
            type="text"
            placeholder="Add a message for the couple..."
            value={message}
            onChange={e => setMessage(e.target.value)}
            className="border rounded px-2 py-1"
            maxLength={120}
            required
          />
          <button
            type="submit"
            className="bg-green-500 text-white px-4 py-2 rounded disabled:opacity-50"
            disabled={!photo || !message || uploading}
          >
            {uploading ? 'Uploading...' : 'Share Memory'}
          </button>
          {success && <div className="text-green-600 text-center">Memory shared! 🎉</div>}
        </form>
      </div>
      {/* Gallery will go here */}
      <div className="w-full max-w-md">
        <h2 className="text-lg font-semibold mb-2">Gallery</h2>
        {loadingGallery ? (
          <div className="text-center text-gray-400">Loading...</div>
        ) : gallery.length === 0 ? (
          <div className="text-center text-gray-400">No memories yet. Be the first!</div>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {gallery.map(photo => (
              <div key={photo.id} className="relative group">
                <img
                  src={photo.url}
                  alt={photo.message}
                  className="w-full h-24 object-cover rounded shadow"
                />
                {photo.message && (
                  <div className="absolute inset-0 bg-black bg-opacity-60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-xs text-white p-2 rounded transition-opacity">
                    {photo.message}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
} 