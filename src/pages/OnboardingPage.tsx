import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Avatar } from '../components/ui/Avatar';
import { ImageCropModal } from '../components/ui/ImageCropModal';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { geocodeAddress } from '../lib/geocoding';
import { uploadProfilePicture, validateImageFile } from '../lib/imageUpload';

export function OnboardingPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [location, setLocation] = useState(''); // For backward compatibility display
  const [loading, setLoading] = useState(false);
  const [geocoding, setGeocoding] = useState(false);
  const [geocodeError, setGeocodeError] = useState<string | null>(null);
  const [_error, setError] = useState<string | null>(null);
  const [coordinates, setCoordinates] = useState<{ latitude: number; longitude: number } | null>(null);
  const [formattedAddress, setFormattedAddress] = useState<string | null>(null);
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [picturePreview, setPicturePreview] = useState<string | null>(null);
  const [pictureError, setPictureError] = useState<string | null>(null);
  const [showCropModal, setShowCropModal] = useState(false);
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      navigate('/');
    }
  }, [user, navigate]);

  // Debounced geocoding
  useEffect(() => {
    if (step !== 2 || !address.trim()) {
      setGeocodeError(null);
      setCoordinates(null);
      setFormattedAddress(null);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setGeocoding(true);
      setGeocodeError(null);
      
      try {
        const result = await geocodeAddress(address.trim());
        
        if (result.error) {
          setGeocodeError(result.error);
          setCoordinates(null);
          setFormattedAddress(null);
        } else {
          setCoordinates({ latitude: result.latitude, longitude: result.longitude });
          setFormattedAddress(result.formattedAddress);
          setGeocodeError(null);
        }
      } catch (err: any) {
        setGeocodeError(err.message || 'No se pudo verificar la dirección');
        setCoordinates(null);
        setFormattedAddress(null);
      } finally {
        setGeocoding(false);
      }
    }, 1000); // 1 second debounce

    return () => clearTimeout(timeoutId);
  }, [address, step]);

  const handleNext = () => {
    if (step === 1) {
      setStep(2);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handlePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      setProfilePicture(null);
      setPicturePreview(null);
      setPictureError(null);
      return;
    }

    const validation = validateImageFile(file);
    if (!validation.valid) {
      setPictureError(validation.error || 'Archivo inválido');
      setProfilePicture(null);
      setPicturePreview(null);
      return;
    }

    setPictureError(null);

    // Read file and show crop modal
    const reader = new FileReader();
    reader.onloadend = () => {
      const imageSrc = reader.result as string;
      setImageToCrop(imageSrc);
      setShowCropModal(true);
    };
    reader.readAsDataURL(file);
  };

  const handleCropComplete = (croppedFile: File) => {
    setProfilePicture(croppedFile);
    setShowCropModal(false);
    setImageToCrop(null);

    // Create preview from cropped file
    const reader = new FileReader();
    reader.onloadend = () => {
      setPicturePreview(reader.result as string);
    };
    reader.readAsDataURL(croppedFile);
  };

  const handleCropCancel = () => {
    setShowCropModal(false);
    setImageToCrop(null);
    // Reset file input
    const fileInput = document.getElementById('profile-picture') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const handleRemovePicture = () => {
    setProfilePicture(null);
    setPicturePreview(null);
    setPictureError(null);
    // Reset file input
    const fileInput = document.getElementById('profile-picture') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const handleComplete = async () => {
    if (!user || !name.trim() || !address.trim()) {
      setError('Por favor completa todos los campos requeridos');
      return;
    }

    if (!coordinates || geocodeError) {
      setError('Por favor ingresa una dirección válida. Asegúrate de que la dirección esté verificada (busca la marca de verificación verde).');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // If still geocoding, wait for it to complete
      if (geocoding) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

      // Upload profile picture if selected
      let avatarUrl: string | null = null;
      if (profilePicture) {
        try {
          avatarUrl = await uploadProfilePicture(user.id, profilePicture);
        } catch (err: any) {
          console.error('Failed to upload profile picture:', err);
          // Don't block onboarding if picture upload fails
          setPictureError(err.message || 'No se pudo subir la imagen');
        }
      }

      // Create profile with geocoded coordinates
      // Use today's date as default start_date (not used for tracking anymore)
      const profileData = {
        id: user.id,
        name: name.trim(),
        location: location.trim() || formattedAddress || address.trim(),
        address: formattedAddress || address.trim(),
        latitude: coordinates.latitude,
        longitude: coordinates.longitude,
        avatar_url: avatarUrl,
        start_date: new Date().toISOString().split('T')[0], // Default to today (not used for tracking)
      };
      const { error: profileError } = await supabase
        .from('profiles')
        .insert(profileData as any);

      if (profileError) throw profileError;

      // Create initial phase unlock for Phase 1
      const unlockData = {
        user_id: user.id,
        phase_number: 1,
      };
      const { error: unlockError } = await supabase
        .from('phase_unlocks')
        .insert(unlockData as any);

      if (unlockError) throw unlockError;

      // Redirect to training page
      navigate('/training');
    } catch (err: any) {
      setError(err.message || 'No se pudo guardar el perfil. Por favor intenta de nuevo.');
      setLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-20 bg-cream">
      {/* Image Crop Modal */}
      {showCropModal && imageToCrop && (
        <ImageCropModal
          imageSrc={imageToCrop}
          onClose={handleCropCancel}
          onCropComplete={handleCropComplete}
          aspectRatio={1}
        />
      )}

      <Card className="w-full max-w-md">
        {/* Progress indicator */}
        <div className="mb-6">
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Paso {step} de 2
            </span>
            <span className="text-sm font-medium text-teal">
              {Math.round((step / 2) * 100)}%
            </span>
          </div>
          <div className="w-full bg-white/50 rounded-full h-2">
            <div
              className="bg-teal h-2 rounded-full transition-all duration-300"
              style={{ width: `${(step / 2) * 100}%` }}
            />
          </div>
        </div>

        {/* Step 1: Welcome */}
        {step === 1 && (
          <div className="text-center">
            <div className="text-6xl mb-6">🌸</div>
            <h2 className="text-3xl font-bold text-teal mb-4">
              ¡Bienvenida a Tu Viaje!
            </h2>
            <p className="text-gray-700 mb-8 text-lg">
              Estamos muy emocionadas de que te unas a nosotras en este viaje transformador de 52 semanas
              hacia el Camino de Santiago. Comencemos con unas preguntas rápidas.
            </p>
            <Button onClick={handleNext} variant="primary" size="lg" className="w-full">
              Comencemos
            </Button>
          </div>
        )}

        {/* Step 2: Name and Location */}
        {step === 2 && (
          <div>
            <h2 className="text-3xl font-bold text-teal mb-6">
              Cuéntanos Sobre Ti
            </h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Tu Nombre <span className="text-red-500">*</span>
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-4 py-3 text-base rounded-lg border-2 border-gray-200 focus:border-teal focus:outline-none bg-white/80"
                  placeholder="Ingresa tu nombre"
                />
              </div>
              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                  Dirección <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    id="address"
                    type="text"
                    value={address}
                    onChange={(e) => {
                      setAddress(e.target.value);
                      setLocation(e.target.value); // Keep location for backward compat
                    }}
                    required
                    className="w-full px-4 py-3 text-base rounded-lg border-2 border-gray-200 focus:border-teal focus:outline-none bg-white/80 pr-10"
                    placeholder="Ingresa tu dirección completa (ej: Av. Principal 123, Ciudad de México, CDMX)"
                  />
                  {geocoding && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <div className="w-5 h-5 border-2 border-teal border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                  {!geocoding && coordinates && !geocodeError && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </div>
                {geocodeError && (
                  <p className="mt-1 text-sm text-red-600">{geocodeError}</p>
                )}
                {formattedAddress && coordinates && !geocodeError && (
                  <p className="mt-1 text-sm text-green-600">
                    ✓ Verificada: {formattedAddress}
                  </p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  Necesitamos tu dirección para conectarte con compañeras cercanas para entrenar juntas.
                </p>
              </div>
              <div>
                <label htmlFor="profile-picture" className="block text-sm font-medium text-gray-700 mb-2">
                  Foto de Perfil <span className="text-gray-400">(Opcional)</span>
                </label>
                <div className="flex items-center gap-4">
                  {picturePreview ? (
                    <>
                      <Avatar avatarUrl={picturePreview} name={name || 'User'} size="lg" />
                      <div className="flex-1">
                        <p className="text-sm text-gray-600 mb-2">
                          {profilePicture?.name}
                        </p>
                        <Button
                          type="button"
                          onClick={handleRemovePicture}
                          variant="ghost"
                          size="sm"
                        >
                          Eliminar
                        </Button>
                      </div>
                    </>
                  ) : (
                    <label
                      htmlFor="profile-picture"
                      className="cursor-pointer flex items-center justify-center w-24 h-24 border-2 border-dashed border-gray-300 rounded-full hover:border-teal transition-colors"
                    >
                      <div className="text-center">
                        <svg className="w-8 h-8 text-gray-400 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        <span className="text-xs text-gray-500">Agregar Foto</span>
                      </div>
                    </label>
                  )}
                  <input
                    id="profile-picture"
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={handlePictureChange}
                    className="hidden"
                  />
                </div>
                {pictureError && (
                  <p className="mt-1 text-sm text-red-600">{pictureError}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  Sube una foto de perfil para que tus compañeras te reconozcan. (JPG, PNG o WebP, máx. 5MB)
                </p>
              </div>
            </div>
            <div className="flex gap-4 mt-6">
              <Button onClick={handleBack} variant="ghost" size="lg" className="flex-1">
                Atrás
              </Button>
              <Button
                onClick={handleComplete}
                variant="primary"
                size="lg"
                className="flex-1"
                disabled={!name.trim() || !address.trim() || geocoding || loading || !coordinates || !!geocodeError}
              >
                {loading ? 'Iniciando...' : 'Comenzar Entrenamiento'}
              </Button>
            </div>
          </div>
        )}

      </Card>
    </div>
  );
}

