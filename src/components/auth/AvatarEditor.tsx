import React, { useRef, useState } from 'react';
import { Camera, Trash2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { userService } from '@/services/userService';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { AVATAR_INPUT_TYPES, avatarFileProblem } from '@/utils/avatarImage';

// ─── AvatarEditor ─────────────────────────────────────────────────────────────
// The profile photo with buttons to add, change or remove it.

export const AvatarEditor: React.FC = () => {
  const { user, updateUser } = useAuth();
  const { addToast } = useToast();
  const fileInput = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState<'upload' | 'remove' | null>(null);

  if (!user) return null;
  const hasPhoto = Boolean(user.avatar && !user.avatar.startsWith('https://ui-avatars.com/'));

  const pick = async (file: File | undefined) => {
    if (fileInput.current) fileInput.current.value = '';
    if (!file) return;
    const problem = avatarFileProblem(file);
    if (problem) {
      addToast({ variant: 'error', title: 'Photo not added', message: problem });
      return;
    }
    setBusy('upload');
    try {
      updateUser(await userService.uploadAvatar(user, file));
      addToast({ variant: 'success', title: 'Profile photo updated', message: 'Your new photo is saved.' });
    } catch (err) {
      addToast({ variant: 'error', title: 'Photo not added', message: (err instanceof Error && err.message) || 'Please try again.' });
    } finally {
      setBusy(null);
    }
  };

  const remove = async () => {
    setBusy('remove');
    try {
      updateUser(await userService.removeAvatar(user));
      addToast({ variant: 'success', title: 'Profile photo removed', message: 'Your initials will show instead.' });
    } catch (err) {
      addToast({ variant: 'error', title: 'Photo not removed', message: (err instanceof Error && err.message) || 'Please try again.' });
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="flex flex-col items-center gap-3 shrink-0">
      <div className="relative">
        <Avatar src={user.avatar} name={user.name || 'Traveler'} size="xl" className="w-24 h-24 text-2xl" />
        <button
          type="button"
          onClick={() => fileInput.current?.click()}
          disabled={busy !== null}
          aria-label={hasPhoto ? 'Change profile photo' : 'Add profile photo'}
          className="absolute -bottom-1 -right-1 p-2 rounded-full bg-[#FFD300] text-[#090C11] shadow-md hover:bg-[#e6be00] disabled:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#090C11] focus-visible:ring-offset-2"
        >
          <Camera size={16} aria-hidden="true" />
        </button>
      </div>
      <input
        ref={fileInput}
        type="file"
        accept={AVATAR_INPUT_TYPES.join(',')}
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
        onChange={(e) => void pick(e.target.files?.[0])}
      />
      <div className="flex flex-wrap justify-center gap-1.5">
        <Button type="button" variant="ghost" size="sm" isLoading={busy === 'upload'} disabled={busy !== null} onClick={() => fileInput.current?.click()}>
          {hasPhoto ? 'Change photo' : 'Add photo'}
        </Button>
        {hasPhoto && (
          <Button type="button" variant="ghost" size="sm" isLoading={busy === 'remove'} disabled={busy !== null} onClick={remove} className="text-red-600 dark:text-red-400">
            <Trash2 size={14} aria-hidden="true" />
            Remove
          </Button>
        )}
      </div>
      <p className="text-[11px] text-muted text-center max-w-[12rem]">JPEG, PNG or WebP. Cropped to a square; location data is removed.</p>
    </div>
  );
};

export default AvatarEditor;
