'use client';
import React, { useRef, useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useParams } from 'next/navigation';
import { FaHeart } from 'react-icons/fa';

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
  attendeeName?: string;
  createdAt: string;
}

interface Couple {
  id: number;
  name: string;
  displayTitle: string;
}

export default function CoupleMomentsPage() {
  const params = useParams();
  const coupleName = params?.coupleName as string;
  const [photo, setPhoto] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [attendeeName, setAttendeeName] = useState('');
  const [mode, setMode] = useState<'camera' | 'upload'>('camera');
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [gallery, setGallery] = useState<Photo[]>([]);
  const [loadingGallery, setLoadingGallery] = useState(false);
  const [couple, setCouple] = useState<Couple | null>(null);
  const webcamRef = useRef<any>(null);

  const fetchCouple = async () => {
    try {
      const res = await fetch(`/api/admin/couples/${coupleName}`);
      if (res.ok) {
        const data = await res.json();
        setCouple(data.couple);
      } else {
        // Handle invalid couple name
        window.location.href = '/';
      }
    } catch (err) {
      console.error('Error fetching couple:', err);
    }
  };

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
    if (coupleName) {
      fetchCouple();
      fetchGallery();
    }
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
    if (!photo || !message || !attendeeName) return;
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
      formData.append('attendeeName', attendeeName);
      const res = await fetch(`/moments/${coupleName}/upload`, {
        method: 'POST',
        body: formData,
      });
      if (res.ok) {
        setSuccess(true);
        setPhoto(null);
        setMessage('');
        setAttendeeName('');
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
    <main className="min-h-screen flex flex-col items-center justify-start p-4 bg-pink-50">
      <h1 className="text-3xl font-extrabold mb-4 text-pink-700 tracking-wide" style={{ fontFamily: 'serif' }}>
        {couple?.displayTitle}
      </h1>
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-6 mb-6 border border-pink-100">
        {photo ? (
          <div className="flex flex-col items-center">
            <img src={photo} alt="Preview" className="w-full rounded-lg mb-2" />
            <button className="text-sm text-pink-500 mb-2" onClick={() => setPhoto(null)}>
              Remove
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className="bg-pink-500 text-white px-6 py-3 rounded-full cursor-pointer hover:bg-pink-600 transition-colors"
            >
              Dodaj fotografijo
            </label>
          </div>
        )}
        <form onSubmit={handleSubmit} className="flex flex-col gap-2 mt-2">
          <input
            type="text"
            placeholder="Tvoje ime"
            value={attendeeName}
            onChange={e => setAttendeeName(e.target.value)}
            className="border rounded-full px-4 py-2 bg-white placeholder-gray-500 text-base text-gray-900"
            required
          />
          <input
            type="text"
            placeholder="Vpiši svoje sporočilo in voščilo"
            value={message}
            onChange={e => setMessage(e.target.value)}
            className="border rounded-full px-4 py-2 bg-white placeholder-gray-500 text-base text-gray-900"
            maxLength={120}
            required
          />
          <button
            type="submit"
            className="bg-pink-500 text-white px-4 py-2 rounded-full disabled:opacity-50"
            disabled={!photo || !message || !attendeeName || uploading}
          >
            {uploading ? 'Uploading...' : 'Deli trenutek'}
          </button>
          {success && <div className="text-green-600 text-center">Memory shared! 🎉</div>}
        </form>
      </div>
      {/* Gallery will go here */}
      <div className="w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4 text-pink-600 tracking-wide" style={{ fontFamily: 'serif' }}>Galerija</h2>
        {loadingGallery ? (
          <div className="text-center text-gray-400">Loading...</div>
        ) : gallery.length === 0 ? (
          <div className="text-center text-gray-400">No memories yet. Be the first!</div>
        ) : (
          <div className="flex flex-col gap-8">
            {gallery.map(photo => (
              <div key={photo.id} className="w-full bg-white rounded-2xl shadow-lg overflow-hidden border border-pink-100">
                <img
                  src={photo.url}
                  alt={photo.message}
                  className="w-full object-cover max-h-96"
                  style={{ aspectRatio: '4/3', objectFit: 'cover' }}
                />
                <div className="p-5 flex flex-col items-center bg-pink-50">
                  {photo.attendeeName && (
                    <div className="font-wedding text-xl text-pink-700 mb-1 flex items-center gap-2" style={{ fontFamily: 'Dancing Script, cursive, serif' }}>
                      <FaHeart className="text-pink-400" />
                      {photo.attendeeName}
                    </div>
                  )}
                  <div className="w-12 border-b-2 border-pink-200 mb-2"></div>
                  {photo.message && (
                    <div className="text-gray-700 text-base italic text-center" style={{ fontFamily: 'serif' }}>
                      “{photo.message}”
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
} 