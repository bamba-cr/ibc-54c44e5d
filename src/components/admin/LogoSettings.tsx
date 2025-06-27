
import { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Upload, Image, Link, RotateCcw } from 'lucide-react';

export const LogoSettings = () => {
  const [logoUrl, setLogoUrl] = useState(localStorage.getItem('custom-logo') || '');
  const [logoText, setLogoText] = useState(localStorage.getItem('logo-text') || 'IBC CONNECT');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: "Erro",
        description: "Por favor, selecione apenas arquivos de imagem.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    
    try {
      // Create a data URL for the image
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        setLogoUrl(dataUrl);
        localStorage.setItem('custom-logo', dataUrl);
        toast({
          title: "Logo atualizada",
          description: "A logomarca foi atualizada com sucesso!",
        });
      };
      reader.readAsDataURL(file);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível fazer o upload da imagem.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleUrlChange = () => {
    localStorage.setItem('custom-logo', logoUrl);
    toast({
      title: "Logo atualizada",
      description: "A logomarca foi atualizada com sucesso!",
    });
  };

  const handleTextChange = () => {
    localStorage.setItem('logo-text', logoText);
    toast({
      title: "Texto da logo atualizado",
      description: "O texto da logomarca foi atualizado com sucesso!",
    });
  };

  const resetToDefault = () => {
    localStorage.removeItem('custom-logo');
    localStorage.removeItem('logo-text');
    setLogoUrl('');
    setLogoText('IBC CONNECT');
    toast({
      title: "Logo resetada",
      description: "A logomarca foi resetada para o padrão.",
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Image className="h-5 w-5" />
            <span>Configurações da Logomarca</span>
          </CardTitle>
          <CardDescription>
            Personalize a logomarca do sistema fazendo upload de uma imagem ou usando uma URL
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Preview da Logo */}
          <div className="flex flex-col items-center space-y-4 p-6 border rounded-lg bg-gradient-to-br from-primary-dark to-primary">
            {logoUrl ? (
              <img 
                src={logoUrl} 
                alt="Logo Preview" 
                className="max-h-20 max-w-60 object-contain"
                onError={() => {
                  setLogoUrl('');
                  toast({
                    title: "Erro",
                    description: "Não foi possível carregar a imagem.",
                    variant: "destructive",
                  });
                }}
              />
            ) : (
              <span className="text-2xl font-milker text-white bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
                {logoText}
              </span>
            )}
            <p className="text-sm text-white/80">Preview da logomarca</p>
          </div>

          {/* Upload de Arquivo */}
          <div className="space-y-2">
            <Label htmlFor="logo-upload">Upload de Imagem</Label>
            <div className="flex items-center space-x-2">
              <Input
                id="logo-upload"
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                ref={fileInputRef}
                className="flex-1"
              />
              <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                variant="outline"
              >
                <Upload className="h-4 w-4 mr-2" />
                {isUploading ? 'Enviando...' : 'Escolher'}
              </Button>
            </div>
          </div>

          {/* URL da Imagem */}
          <div className="space-y-2">
            <Label htmlFor="logo-url">URL da Imagem</Label>
            <div className="flex items-center space-x-2">
              <Input
                id="logo-url"
                type="url"
                placeholder="https://exemplo.com/logo.png"
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                className="flex-1"
              />
              <Button onClick={handleUrlChange} variant="outline">
                <Link className="h-4 w-4 mr-2" />
                Aplicar
              </Button>
            </div>
          </div>

          {/* Texto da Logo */}
          <div className="space-y-2">
            <Label htmlFor="logo-text">Texto da Logomarca</Label>
            <div className="flex items-center space-x-2">
              <Input
                id="logo-text"
                type="text"
                placeholder="IBC CONNECT"
                value={logoText}
                onChange={(e) => setLogoText(e.target.value)}
                className="flex-1"
              />
              <Button onClick={handleTextChange} variant="outline">
                Aplicar
              </Button>
            </div>
          </div>

          {/* Reset */}
          <Button onClick={resetToDefault} variant="destructive" className="w-full">
            <RotateCcw className="h-4 w-4 mr-2" />
            Resetar para Padrão
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
