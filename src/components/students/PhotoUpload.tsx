import { useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface PhotoUploadProps {
  onPhotoChange: (file: File | null) => void;
}

export const PhotoUpload = ({ onPhotoChange }: PhotoUploadProps) => {
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onPhotoChange(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div>
      <Label htmlFor="photo">Foto (opcional)</Label>
      <Input
        id="photo"
        type="file"
        accept="image/*"
        onChange={handlePhotoChange}
        ref={fileInputRef}
      />
      {photoPreview && (
        <div className="mt-2">
          <img
            src={photoPreview}
            alt="Preview"
            className="w-32 h-32 object-cover rounded-lg"
          />
        </div>
      )}
    </div>
  );
};