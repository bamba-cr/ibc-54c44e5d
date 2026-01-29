import { useState, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Camera, Loader2, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ProfilePhotoUploadProps {
  currentPhotoUrl: string | null;
  userId: string;
  fallbackInitials: string;
  onPhotoUpdated: (url: string) => void;
}

export const ProfilePhotoUpload = ({
  currentPhotoUrl,
  userId,
  fallbackInitials,
  onPhotoUpdated,
}: ProfilePhotoUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Por favor, selecione uma imagem válida");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("A imagem deve ter no máximo 5MB");
      return;
    }

    // Preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    setUploading(true);

    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${userId}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from("student-photos")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("student-photos")
        .getPublicUrl(filePath);

      const publicUrl = urlData.publicUrl;

      // Update profile
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: publicUrl })
        .eq("user_id", userId);

      if (updateError) throw updateError;

      onPhotoUpdated(publicUrl);
      toast.success("Foto atualizada com sucesso!");
    } catch (error: any) {
      console.error("Error uploading photo:", error);
      toast.error("Erro ao fazer upload da foto");
      setPreviewUrl(null);
    } finally {
      setUploading(false);
    }
  };

  const handleRemovePhoto = async () => {
    setUploading(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ avatar_url: null })
        .eq("user_id", userId);

      if (error) throw error;

      setPreviewUrl(null);
      onPhotoUpdated("");
      toast.success("Foto removida com sucesso!");
    } catch (error: any) {
      console.error("Error removing photo:", error);
      toast.error("Erro ao remover foto");
    } finally {
      setUploading(false);
    }
  };

  const displayUrl = previewUrl || currentPhotoUrl;

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        <Avatar className="h-24 w-24 border-4 border-border">
          <AvatarImage src={displayUrl || ""} />
          <AvatarFallback className="text-xl bg-primary/10 text-primary">
            {fallbackInitials}
          </AvatarFallback>
        </Avatar>
        {uploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-full">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        )}
      </div>
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
        >
          <Camera className="h-4 w-4 mr-2" />
          Alterar foto
        </Button>
        {displayUrl && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleRemovePhoto}
            disabled={uploading}
            className="text-destructive hover:text-destructive"
          >
            <X className="h-4 w-4 mr-2" />
            Remover
          </Button>
        )}
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileSelect}
      />
    </div>
  );
};
