'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import { Star, Trash2, Upload } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { getCourtPhotoUrl, cn } from '@/lib/utils';
import type { CourtPhoto } from '@/types/database.types';

export function CourtPhotoManager({ courtId, initialPhotos }: { courtId: string; initialPhotos: CourtPhoto[] }) {
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [photos, setPhotos] = useState(initialPhotos);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    const path = `${courtId}/${Date.now()}-${file.name}`;
    const { error: uploadError } = await supabase.storage.from('court-photos').upload(path, file);

    if (uploadError) {
      setUploading(false);
      setError(uploadError.message);
      return;
    }

    const { data, error: insertError } = await supabase
      .from('court_photos')
      .insert({ court_id: courtId, storage_path: path, is_primary: photos.length === 0 })
      .select()
      .single();

    setUploading(false);

    if (insertError) {
      setError(insertError.message);
      return;
    }

    setPhotos((prev) => [...prev, data]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  async function handleSetPrimary(photoId: string) {
    await supabase.from('court_photos').update({ is_primary: false }).eq('court_id', courtId);
    await supabase.from('court_photos').update({ is_primary: true }).eq('id', photoId);
    setPhotos((prev) => prev.map((p) => ({ ...p, is_primary: p.id === photoId })));
  }

  async function handleDelete(photo: CourtPhoto) {
    await supabase.storage.from('court-photos').remove([photo.storage_path]);
    await supabase.from('court_photos').delete().eq('id', photo.id);
    setPhotos((prev) => prev.filter((p) => p.id !== photo.id));
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {photos.map((photo) => (
          <div key={photo.id} className="group relative aspect-square overflow-hidden rounded-xl border border-border">
            <Image src={getCourtPhotoUrl(photo.storage_path)} alt="" fill sizes="200px" className="object-cover" />
            <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
              <button
                type="button"
                onClick={() => handleSetPrimary(photo.id)}
                title="Set as primary"
                className={cn('rounded-full p-2', photo.is_primary ? 'bg-primary text-primary-fg' : 'bg-white/20 text-white')}
              >
                <Star size={14} fill={photo.is_primary ? 'currentColor' : 'none'} />
              </button>
              <button type="button" onClick={() => handleDelete(photo)} title="Delete" className="rounded-full bg-white/20 p-2 text-white">
                <Trash2 size={14} />
              </button>
            </div>
            {photo.is_primary && (
              <span className="absolute left-2 top-2 rounded-full bg-primary px-2 py-0.5 text-[10px] font-medium text-primary-fg">
                Primary
              </span>
            )}
          </div>
        ))}

        <label className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed border-border text-muted hover:border-primary/50 hover:text-primary">
          <Upload size={18} />
          <span className="text-xs">{uploading ? 'Uploading…' : 'Add Photo'}</span>
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} disabled={uploading} />
        </label>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
