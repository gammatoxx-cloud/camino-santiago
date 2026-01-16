import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { SectionHeader } from '../components/ui/SectionHeader';
import { StatCard } from '../components/ui/StatCard';
import { Avatar } from '../components/ui/Avatar';
import { ImageCropModal } from '../components/ui/ImageCropModal';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { getCurrentPhase } from '../lib/trainingData';
import { geocodeAddress } from '../lib/geocoding';
import { uploadProfilePicture, deleteProfilePicture, validateImageFile } from '../lib/imageUpload';
import { updateEmail, updatePassword } from '../lib/auth';
import { validatePassword, isPasswordValid } from '../lib/passwordValidation';
import { getSubscriptionStatus, createPaymentLink } from '../lib/wixPayments';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import type { UserProfile } from '../types';
import type { Database } from '../lib/database.types';

export function ProfilePage() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [totalDistance, setTotalDistance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [geocoding, setGeocoding] = useState(false);
  const [geocodeError, setGeocodeError] = useState<string | null>(null);
  const [coordinates, setCoordinates] = useState<{ latitude: number; longitude: number } | null>(null);
  const [formattedAddress, setFormattedAddress] = useState<string | null>(null);
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [picturePreview, setPicturePreview] = useState<string | null>(null);
  const [pictureError, setPictureError] = useState<string | null>(null);
  const [uploadingPicture, setUploadingPicture] = useState(false);
  const [removePicture, setRemovePicture] = useState(false);
  const [showCropModal, setShowCropModal] = useState(false);
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [editingEmail, setEditingEmail] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [updatingEmail, setUpdatingEmail] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [editingPassword, setEditingPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [updatingPassword, setUpdatingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [subscription, setSubscription] = useState<any>(null);
  const [subscriptionLoading, setSubscriptionLoading] = useState(true);
  const [creatingPaymentLink, setCreatingPaymentLink] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }
    loadProfile();
    loadSubscription();
  }, [user, navigate]);

  // Reload subscription when page becomes visible (e.g., returning from payment)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && user) {
        loadSubscription();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [user]);

  const loadSubscription = async () => {
    if (!user) return;
    
    try {
      setSubscriptionLoading(true);
      const sub = await getSubscriptionStatus();
      setSubscription(sub);
    } catch (error) {
      console.error('Error loading subscription:', error);
    } finally {
      setSubscriptionLoading(false);
    }
  };

  const handleSubscribe = async () => {
    if (!user || !profile) {
      alert('Por favor, completa tu perfil primero.');
      return;
    }

    setCreatingPaymentLink(true);

    try {
      const result = await createPaymentLink(
        user.email || '',
        profile.name,
        user.id
      );

      if (result.error || !result.paymentLinkUrl) {
        console.error('Payment link creation failed:', result);
        // Show more detailed error message
        const errorMsg = result.error || 'No se pudo crear el enlace de pago. Por favor, intenta de nuevo.';
        alert(`Error: ${errorMsg}\n\nSi el problema persiste, verifica:\n1. Que la función Edge esté desplegada\n2. Que los secretos estén configurados en Supabase\n3. Revisa la consola del navegador para más detalles`);
        setCreatingPaymentLink(false);
        return;
      }

      // Redirect to Wix checkout
      window.location.href = result.paymentLinkUrl;
    } catch (err) {
      console.error('Error creating payment link:', err);
      alert('Ocurrió un error. Por favor, intenta de nuevo.');
      setCreatingPaymentLink(false);
    }
  };

  const loadProfile = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Load profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (profileError) throw profileError;
      if (!profileData) {
        navigate('/onboarding');
        return;
      }

      const typedProfile = profileData as UserProfile;
      setProfile(typedProfile);
      setEditName(typedProfile.name);
      setEditLocation(typedProfile.location || '');
      setEditAddress(typedProfile.address || typedProfile.location || '');
      if (typedProfile.latitude && typedProfile.longitude) {
        setCoordinates({ latitude: typedProfile.latitude, longitude: typedProfile.longitude });
      }
      setFormattedAddress(typedProfile.address || null);
      setNewEmail(user.email || '');
      // Reset picture editing state
      setProfilePicture(null);
      setPicturePreview(null);
      setPictureError(null);
      setRemovePicture(false);

      // Calculate total distance
      const { data: completionsData, error: completionsError } = await supabase
        .from('walk_completions')
        .select('distance_km')
        .eq('user_id', user.id);

      if (completionsError) throw completionsError;

      const total = (completionsData as { distance_km: number }[] | null)?.reduce((sum, c) => sum + Number(c.distance_km), 0) || 0;
      setTotalDistance(Math.round(total * 10) / 10);

    } catch (err: any) {
      console.error('Failed to load profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!user || !profile) return;

    try {
      // If address was changed, geocode it
      let finalCoordinates = coordinates;
      let finalFormattedAddress = formattedAddress;
      
      if (editAddress.trim() && editAddress !== (profile.address || profile.location || '')) {
        setGeocoding(true);
        setGeocodeError(null);
        
        const geocodeResult = await geocodeAddress(editAddress.trim());
        
        if (geocodeResult.error) {
          setGeocodeError(geocodeResult.error);
          setGeocoding(false);
          return;
        }
        
        finalCoordinates = { latitude: geocodeResult.latitude, longitude: geocodeResult.longitude };
        finalFormattedAddress = geocodeResult.formattedAddress;
        setCoordinates(finalCoordinates);
        setFormattedAddress(finalFormattedAddress);
        setGeocoding(false);
      }

      // Handle profile picture upload/removal
      let finalAvatarUrl = profile.avatar_url;
      if (removePicture) {
        // Delete old picture if it exists
        if (profile.avatar_url) {
          await deleteProfilePicture(profile.avatar_url);
        }
        finalAvatarUrl = null;
      } else if (profilePicture) {
        setUploadingPicture(true);
        setPictureError(null);
        
        try {
          // Delete old picture if it exists
          if (profile.avatar_url) {
            await deleteProfilePicture(profile.avatar_url);
          }
          
          // Upload new picture
          finalAvatarUrl = await uploadProfilePicture(user.id, profilePicture);
        } catch (err: any) {
          setPictureError(err.message || 'Failed to upload picture');
          setUploadingPicture(false);
          return;
        }
        setUploadingPicture(false);
      }

      const updateData: Database['public']['Tables']['profiles']['Update'] = {
        name: editName.trim(),
        location: editLocation.trim() || finalFormattedAddress || editAddress.trim() || null,
        address: finalFormattedAddress || editAddress.trim() || null,
        latitude: finalCoordinates?.latitude || null,
        longitude: finalCoordinates?.longitude || null,
        avatar_url: finalAvatarUrl,
        updated_at: new Date().toISOString(),
      };
      
      const { error } = await (supabase
        .from('profiles') as any)
        .update(updateData)
        .eq('id', user.id);

      if (error) throw error;

      setProfile((prev) => prev ? {
        ...prev,
        name: editName.trim(),
        location: editLocation.trim() || finalFormattedAddress || editAddress.trim() || null,
        address: finalFormattedAddress || editAddress.trim() || null,
        latitude: finalCoordinates?.latitude || null,
        longitude: finalCoordinates?.longitude || null,
        avatar_url: finalAvatarUrl,
      } : null);
      setEditing(false);
      setGeocodeError(null);
      setProfilePicture(null);
      setPicturePreview(null);
      setPictureError(null);
      setRemovePicture(false);
    } catch (err: any) {
      alert('Error al actualizar el perfil: ' + err.message);
      setGeocoding(false);
      setUploadingPicture(false);
    }
  };

  const handlePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      setProfilePicture(null);
      setPicturePreview(null);
      setPictureError(null);
      setRemovePicture(false);
      return;
    }

    const validation = validateImageFile(file);
    if (!validation.valid) {
      setPictureError(validation.error || 'Invalid file');
      setProfilePicture(null);
      setPicturePreview(null);
      setRemovePicture(false);
      return;
    }

    setPictureError(null);
    setRemovePicture(false); // Clear remove flag when selecting new picture

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
    const fileInput = document.getElementById('profile-picture-edit') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const handleRemovePicture = () => {
    setProfilePicture(null);
    setPicturePreview(null);
    setPictureError(null);
    setRemovePicture(true);
    // Reset file input
    const fileInput = document.getElementById('profile-picture-edit') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  // Debounced geocoding when editing address
  useEffect(() => {
    if (!editing || !editAddress.trim() || editAddress === (profile?.address || profile?.location || '')) {
      return;
    }

    const timeoutId = setTimeout(async () => {
      setGeocoding(true);
      setGeocodeError(null);
      
      try {
        const result = await geocodeAddress(editAddress.trim());
        
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
        setGeocodeError(err.message || 'Error al verificar la dirección');
        setCoordinates(null);
        setFormattedAddress(null);
      } finally {
        setGeocoding(false);
      }
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [editAddress, editing, profile]);

  const handleResetProgress = async () => {
    if (!user) return;

    setResetting(true);
    try {
      // Delete all completions
      const { error: completionsError } = await supabase
        .from('walk_completions')
        .delete()
        .eq('user_id', user.id);

      if (completionsError) throw completionsError;

      // Delete all phase unlocks except Phase 1
      const { error: unlocksError } = await supabase
        .from('phase_unlocks')
        .delete()
        .eq('user_id', user.id)
        .gt('phase_number', 1);

      if (unlocksError) throw unlocksError;

      // Ensure Phase 1 is unlocked
      const { data: existingUnlock } = await supabase
        .from('phase_unlocks')
        .select('id')
        .eq('user_id', user.id)
        .eq('phase_number', 1)
        .single();

      if (!existingUnlock) {
        const insertData: Database['public']['Tables']['phase_unlocks']['Insert'] = {
          user_id: user.id,
          phase_number: 1,
        };
        await (supabase
          .from('phase_unlocks') as any)
          .insert(insertData);
      }

      setShowResetModal(false);
      setTotalDistance(0);
      alert('¡El progreso ha sido reiniciado. Puedes empezar de nuevo!');
    } catch (err: any) {
      alert('Error al reiniciar el progreso: ' + err.message);
    } finally {
      setResetting(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const passwordRequirements = useMemo(
    () => (editingPassword ? validatePassword(newPassword) : null),
    [newPassword, editingPassword]
  );

  const isPasswordValidForUpdate = useMemo(
    () => passwordRequirements && isPasswordValid(passwordRequirements),
    [passwordRequirements]
  );

  const handleUpdateEmail = async () => {
    if (!user || !newEmail.trim()) return;

    if (newEmail === user.email) {
      setEditingEmail(false);
      return;
    }

    setUpdatingEmail(true);
    setEmailError(null);

    try {
      const { error } = await updateEmail(newEmail.trim());
      if (error) throw error;
      
      alert('Se ha enviado un correo de confirmación a tu nueva dirección de correo electrónico. Por favor, verifica tu nuevo correo para completar el cambio.');
      setEditingEmail(false);
    } catch (err: any) {
      setEmailError(err.message || 'Error al actualizar el correo electrónico');
    } finally {
      setUpdatingEmail(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (!newPassword || !confirmPassword) return;

    if (newPassword !== confirmPassword) {
      setPasswordError('Las contraseñas no coinciden');
      return;
    }

    if (!isPasswordValidForUpdate) {
      setPasswordError('Por favor asegúrate de que tu contraseña cumpla con todos los requisitos');
      return;
    }

    setUpdatingPassword(true);
    setPasswordError(null);

    try {
      const { error } = await updatePassword(newPassword);
      if (error) throw error;
      
      alert('Tu contraseña ha sido actualizada exitosamente.');
      setEditingPassword(false);
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setPasswordError(err.message || 'Error al actualizar la contraseña');
    } finally {
      setUpdatingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <div className="text-teal text-xl">Cargando perfil...</div>
      </div>
    );
  }

  if (!profile || !user) {
    return null;
  }

  // Start date tracking disabled - using week 1 for display purposes
  const currentWeek = 1;
  const currentPhase = getCurrentPhase(currentWeek);

  return (
    <div className="min-h-screen bg-cream pb-20 md:pb-6 pt-8 md:pt-12">
      <div className="max-w-2xl mx-auto px-4 py-4 md:py-8">
        <SectionHeader label="Perfil" icon="👤" />
        <h1 className="text-heading-1 text-teal mb-12 text-center">
          Tu Perfil
        </h1>

        <Card variant="elevated" className="mb-6">
          {!editing ? (
            <div>
              <div className="mb-8">
                <div className="flex justify-center mb-6">
                  <Avatar avatarUrl={profile.avatar_url} name={profile.name} size="lg" />
                </div>
                <h2 className="text-heading-3 text-teal mb-6">Información Personal</h2>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-600 mb-2 uppercase tracking-wide">Nombre</h3>
                    <p className="text-xl font-semibold text-gray-800">{profile.name}</p>
                  </div>
                  {profile.address && (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-600 mb-2 uppercase tracking-wide">Dirección</h3>
                      <p className="text-xl font-semibold text-gray-800">{profile.address}</p>
                    </div>
                  )}
                  {profile.location && profile.location !== profile.address && (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-600 mb-2 uppercase tracking-wide">Ubicación</h3>
                      <p className="text-xl font-semibold text-gray-800">{profile.location}</p>
                    </div>
                  )}
                  {profile.latitude && profile.longitude && (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-600 mb-2 uppercase tracking-wide">Coordenadas</h3>
                      <p className="text-sm font-semibold text-gray-600">
                        {profile.latitude.toFixed(6)}, {profile.longitude.toFixed(6)}
                      </p>
                    </div>
                  )}
                </div>
              </div>
              <Button
                onClick={() => setEditing(true)}
                variant="secondary"
                size="md"
                className="w-full"
              >
                Editar Perfil
              </Button>
            </div>
          ) : (
            <div>
              <h2 className="text-heading-3 text-teal mb-6">Editar Perfil</h2>
              
              {/* Profile Picture Section */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                  Foto de Perfil
                </label>
                <div className="flex items-center gap-4">
                  <Avatar 
                    avatarUrl={removePicture ? null : (picturePreview || profile.avatar_url)} 
                    name={editName || profile.name} 
                    size="lg" 
                  />
                  <div className="flex-1">
                    <div className="flex gap-2 mb-2">
                      <Button 
                        type="button" 
                        variant="secondary" 
                        size="sm"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          const input = document.getElementById('profile-picture-edit') as HTMLInputElement;
                          if (input) {
                            input.click();
                          }
                        }}
                      >
                        {(removePicture ? false : (profile.avatar_url || picturePreview)) ? 'Cambiar Foto' : 'Subir Foto'}
                      </Button>
                      {(removePicture ? false : (profile.avatar_url || picturePreview)) && (
                        <Button
                          type="button"
                          onClick={handleRemovePicture}
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:bg-red-50"
                        >
                          Eliminar
                        </Button>
                      )}
                    </div>
                    <input
                      id="profile-picture-edit"
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      onChange={handlePictureChange}
                      className="hidden"
                    />
                    {pictureError && (
                      <p className="text-sm text-red-600">{pictureError}</p>
                    )}
                    {picturePreview && !removePicture && (
                      <p className="text-xs text-gray-500 mt-1">
                        Nueva foto seleccionada. Guarda los cambios para aplicarla.
                      </p>
                    )}
                    {removePicture && (
                      <p className="text-xs text-orange-600 mt-1">
                        La foto será eliminada al guardar los cambios.
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      JPG, PNG o WebP, máximo 5MB
                    </p>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                  Nombre
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-4 py-3 text-base rounded-xl border-2 border-gray-200 focus:border-teal focus:outline-none bg-white/90 focus:ring-2 focus:ring-teal/20"
                />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                  Ubicación de Visualización
                </label>
                <input
                  type="text"
                  value={editLocation}
                  onChange={(e) => setEditLocation(e.target.value)}
                  className="w-full px-4 py-3 text-base rounded-xl border-2 border-gray-200 focus:border-teal focus:outline-none bg-white/90 focus:ring-2 focus:ring-teal/20"
                  placeholder="Ciudad, Estado"
                />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                  Dirección (para emparejamiento de equipos)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={editAddress}
                    onChange={(e) => {
                      setEditAddress(e.target.value);
                      if (!editLocation) setEditLocation(e.target.value);
                    }}
                    className="w-full px-4 py-3 text-base rounded-xl border-2 border-gray-200 focus:border-teal focus:outline-none bg-white/90 focus:ring-2 focus:ring-teal/20 pr-10"
                    placeholder="Dirección completa para geocodificación"
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
                    ✓ Verificado: {formattedAddress}
                  </p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  Tu dirección se usa para conectarte con compañeros de equipo cercanos. Solo se muestra la distancia aproximada a otros usuarios.
                </p>
              </div>
              <div className="flex gap-4">
                <Button
                  onClick={() => {
                    setEditing(false);
                    setEditName(profile.name);
                    setEditLocation(profile.location || '');
                    setEditAddress(profile.address || profile.location || '');
                    setGeocodeError(null);
                    setProfilePicture(null);
                    setPicturePreview(null);
                    setPictureError(null);
                    setRemovePicture(false);
                    if (profile.latitude && profile.longitude) {
                      setCoordinates({ latitude: profile.latitude, longitude: profile.longitude });
                      setFormattedAddress(profile.address || null);
                    }
                  }}
                  variant="ghost"
                  size="md"
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleSaveProfile}
                  variant="primary"
                  size="md"
                  className="flex-1"
                  disabled={!editName.trim() || uploadingPicture || geocoding}
                >
                  {uploadingPicture ? 'Subiendo foto...' : 'Guardar'}
                </Button>
              </div>
            </div>
          )}
        </Card>

        <div className="mb-8">
          <SectionHeader label="Progreso" icon="📊" className="mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard
              number={currentWeek}
              label="Semana Actual"
            />
            {currentPhase && (
              <StatCard
                number={`${currentPhase.number}`}
                label={`Fase: ${currentPhase.name}`}
              />
            )}
            <StatCard
              number={`${totalDistance}`}
              label="Distancia Total (km)"
            />
          </div>
        </div>

        {/* Tu Plan Section */}
        <Card variant="elevated" className="mb-6">
          <h2 className="text-heading-3 text-teal mb-6">Tu Plan</h2>
          
          {subscriptionLoading ? (
            <div className="text-center py-4">
              <div className="text-teal">Cargando estado de suscripción...</div>
            </div>
          ) : subscription && subscription.status === 'active' ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-1">Suscripción Activa</h3>
                  <p className="text-sm text-gray-600">Plan Mensual - $20/mes</p>
                </div>
                <span className="px-4 py-2 rounded-full text-sm font-semibold bg-green-100 text-green-800">
                  Activa
                </span>
              </div>
              
              <div className="pt-4 border-t border-gray-200 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Período actual:</span>
                  <span className="font-semibold text-gray-900">
                    {format(new Date(subscription.current_period_start), 'd MMM yyyy', { locale: es })} -{' '}
                    {format(new Date(subscription.current_period_end), 'd MMM yyyy', { locale: es })}
                  </span>
                </div>
                {subscription.cancel_at_period_end && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Renovación:</span>
                    <span className="font-semibold text-yellow-700">Se cancelará al final del período</span>
                  </div>
                )}
              </div>

              <Button
                onClick={() => navigate('/subscription')}
                variant="secondary"
                size="md"
                className="w-full mt-4"
              >
                Gestionar Suscripción
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">No tienes una suscripción activa</h3>
                <p className="text-gray-600 mb-4">
                  Suscríbete por $20/mes para acceder a todo el programa de entrenamiento del Camino de Santiago.
                </p>
                <ul className="space-y-2 text-gray-700 mb-6 text-sm">
                  <li className="flex items-start">
                    <span className="text-teal mr-2">✓</span>
                    <span>Programa completo de 52 semanas</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-teal mr-2">✓</span>
                    <span>Seguimiento de progreso y estadísticas</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-teal mr-2">✓</span>
                    <span>Acceso a videos y recursos</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-teal mr-2">✓</span>
                    <span>Funciones de comunidad</span>
                  </li>
                </ul>
              </div>
              
              <Button
                onClick={handleSubscribe}
                variant="primary"
                size="lg"
                className="w-full"
                disabled={creatingPaymentLink}
              >
                {creatingPaymentLink ? 'Procesando...' : 'Suscribirse por $20/mes'}
              </Button>
            </div>
          )}
        </Card>

        <Card variant="elevated" className="mb-6">
          <h2 className="text-heading-3 text-teal mb-6">Configuración de Cuenta</h2>
          
          {/* Email Update Section */}
          <div className="mb-8 pb-8 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-1">Correo Electrónico</h3>
                <p className="text-sm text-gray-600">{user.email}</p>
              </div>
              {!editingEmail && (
                <Button
                  onClick={() => {
                    setEditingEmail(true);
                    setNewEmail(user.email || '');
                    setEmailError(null);
                  }}
                  variant="secondary"
                  size="sm"
                >
                  Cambiar
                </Button>
              )}
            </div>
            
            {editingEmail && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                    Nuevo Correo Electrónico
                  </label>
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => {
                      setNewEmail(e.target.value);
                      setEmailError(null);
                    }}
                    className="w-full px-4 py-3 text-base rounded-xl border-2 border-gray-200 focus:border-teal focus:outline-none bg-white/90 focus:ring-2 focus:ring-teal/20"
                    placeholder="nuevo@email.com"
                  />
                  {emailError && (
                    <p className="mt-1 text-sm text-red-600">{emailError}</p>
                  )}
                </div>
                <div className="flex gap-4">
                  <Button
                    onClick={() => {
                      setEditingEmail(false);
                      setNewEmail(user.email || '');
                      setEmailError(null);
                    }}
                    variant="ghost"
                    size="md"
                    className="flex-1"
                    disabled={updatingEmail}
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleUpdateEmail}
                    variant="primary"
                    size="md"
                    className="flex-1"
                    disabled={updatingEmail || !newEmail.trim() || newEmail === user.email}
                  >
                    {updatingEmail ? 'Actualizando...' : 'Actualizar Correo'}
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Password Update Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-1">Contraseña</h3>
                <p className="text-sm text-gray-600">••••••••</p>
              </div>
              {!editingPassword && (
                <Button
                  onClick={() => {
                    setEditingPassword(true);
                    setNewPassword('');
                    setConfirmPassword('');
                    setPasswordError(null);
                  }}
                  variant="secondary"
                  size="sm"
                >
                  Cambiar
                </Button>
              )}
            </div>
            
            {editingPassword && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                    Nueva Contraseña
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => {
                        setNewPassword(e.target.value);
                        setPasswordError(null);
                      }}
                      className="w-full px-4 py-3 pr-12 text-base rounded-xl border-2 border-gray-200 focus:border-teal focus:outline-none bg-white/90 focus:ring-2 focus:ring-teal/20"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none focus:text-teal transition-colors"
                      aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                    >
                      {showPassword ? (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                          />
                        </svg>
                      ) : (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                      )}
                    </button>
                  </div>
                  
                  {passwordRequirements && (
                    <div className="mt-3 space-y-1.5">
                      <div className="text-xs text-gray-600 font-medium mb-1.5">
                        La contraseña debe contener:
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center text-sm">
                          {passwordRequirements.minLength ? (
                            <svg
                              className="h-4 w-4 text-green-600 mr-2 flex-shrink-0"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          ) : (
                            <svg
                              className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                          )}
                          <span
                            className={
                              passwordRequirements.minLength
                                ? 'text-green-700'
                                : 'text-gray-600'
                            }
                          >
                            Al menos 8 caracteres
                          </span>
                        </div>
                        <div className="flex items-center text-sm">
                          {passwordRequirements.hasLowercase ? (
                            <svg
                              className="h-4 w-4 text-green-600 mr-2 flex-shrink-0"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          ) : (
                            <svg
                              className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                          )}
                          <span
                            className={
                              passwordRequirements.hasLowercase
                                ? 'text-green-700'
                                : 'text-gray-600'
                            }
                          >
                            Una letra minúscula
                          </span>
                        </div>
                        <div className="flex items-center text-sm">
                          {passwordRequirements.hasUppercase ? (
                            <svg
                              className="h-4 w-4 text-green-600 mr-2 flex-shrink-0"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          ) : (
                            <svg
                              className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                          )}
                          <span
                            className={
                              passwordRequirements.hasUppercase
                                ? 'text-green-700'
                                : 'text-gray-600'
                            }
                          >
                            Una letra mayúscula
                          </span>
                        </div>
                        <div className="flex items-center text-sm">
                          {passwordRequirements.hasDigit ? (
                            <svg
                              className="h-4 w-4 text-green-600 mr-2 flex-shrink-0"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          ) : (
                            <svg
                              className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                          )}
                          <span
                            className={
                              passwordRequirements.hasDigit
                                ? 'text-green-700'
                                : 'text-gray-600'
                            }
                          >
                            Un dígito
                          </span>
                        </div>
                        <div className="flex items-center text-sm">
                          {passwordRequirements.hasSymbol ? (
                            <svg
                              className="h-4 w-4 text-green-600 mr-2 flex-shrink-0"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          ) : (
                            <svg
                              className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                          )}
                          <span
                            className={
                              passwordRequirements.hasSymbol
                                ? 'text-green-700'
                                : 'text-gray-600'
                            }
                          >
                            Un símbolo (!@#$%^&*...)
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                    Confirmar Nueva Contraseña
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        setPasswordError(null);
                      }}
                      className="w-full px-4 py-3 pr-12 text-base rounded-xl border-2 border-gray-200 focus:border-teal focus:outline-none bg-white/90 focus:ring-2 focus:ring-teal/20"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none focus:text-teal transition-colors"
                      aria-label={showConfirmPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                    >
                      {showConfirmPassword ? (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                          />
                        </svg>
                      ) : (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
                
                {passwordError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                    {passwordError}
                  </div>
                )}
                
                <div className="flex gap-4">
                  <Button
                    onClick={() => {
                      setEditingPassword(false);
                      setNewPassword('');
                      setConfirmPassword('');
                      setPasswordError(null);
                    }}
                    variant="ghost"
                    size="md"
                    className="flex-1"
                    disabled={updatingPassword}
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleUpdatePassword}
                    variant="primary"
                    size="md"
                    className="flex-1"
                    disabled={updatingPassword || !isPasswordValidForUpdate || newPassword !== confirmPassword}
                  >
                    {updatingPassword ? 'Actualizando...' : 'Actualizar Contraseña'}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </Card>

        <Card variant="elevated" className="mb-6">
          <h2 className="text-heading-3 text-teal mb-6">Acciones de Cuenta</h2>
          <div className="space-y-4">
            <Button
              onClick={() => setShowResetModal(true)}
              variant="ghost"
              size="md"
              className="w-full text-red-600 hover:bg-red-50"
            >
              Reiniciar Progreso
            </Button>
            <Button
              onClick={handleSignOut}
              variant="secondary"
              size="md"
              className="w-full"
            >
              Cerrar Sesión
            </Button>
          </div>
        </Card>

        {/* Image Crop Modal */}
        {showCropModal && imageToCrop && (
          <ImageCropModal
            imageSrc={imageToCrop}
            onClose={handleCropCancel}
            onCropComplete={handleCropComplete}
            aspectRatio={1}
          />
        )}

        {/* Reset Confirmation Modal */}
        {showResetModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <Card variant="elevated" className="max-w-md w-full">
              <h3 className="text-heading-2 text-teal mb-4">
                ¿Reiniciar Progreso?
              </h3>
              <p className="text-gray-700 mb-8 leading-relaxed">
                Esto eliminará todas tus caminatas completadas y te reiniciará a la Fase 1.
                Esta acción no se puede deshacer. ¿Estás seguro?
              </p>
              <div className="flex gap-4">
                <Button
                  onClick={() => setShowResetModal(false)}
                  variant="ghost"
                  size="md"
                  className="flex-1"
                  disabled={resetting}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleResetProgress}
                  variant="primary"
                  size="md"
                  className="flex-1 bg-red-600 hover:bg-red-700"
                  disabled={resetting}
                >
                  {resetting ? 'Reiniciando...' : 'Reiniciar Progreso'}
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

