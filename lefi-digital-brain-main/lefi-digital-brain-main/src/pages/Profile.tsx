import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Users, UserPlus, Copy, Check, X, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { useFriends } from '@/hooks/useFriends';
import { useToast } from '@/hooks/use-toast';

export default function Profile() {
  const { user, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading, updateProfile, findUserByLefiCode } = useProfile();
  const { friends, pendingRequests, loading: friendsLoading, sendFriendRequest, acceptFriendRequest, rejectFriendRequest, removeFriend } = useFriends();
  const { toast } = useToast();
  
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [friendCode, setFriendCode] = useState('');
  const [copied, setCopied] = useState(false);

  React.useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name || '');
      setBio(profile.bio || '');
    }
  }, [profile]);

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      window.location.href = '/auth';
    }
  }, [user, authLoading]);

  const handleSaveProfile = async () => {
    try {
      await updateProfile({
        display_name: displayName,
        bio: bio
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const copyLefiCode = async () => {
    if (profile?.lefi_code) {
      await navigator.clipboard.writeText(profile.lefi_code);
      setCopied(true);
      toast({
        title: "Código copiado",
        description: "Tu código LEFI fue copiado al portapapeles",
      });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleAddFriend = async () => {
    if (!friendCode.trim()) return;
    
    try {
      const friendProfile = await findUserByLefiCode(friendCode.trim());
      if (!friendProfile) {
        toast({
          title: "Usuario no encontrado",
          description: "No se encontró ningún usuario con ese código LEFI",
          variant: "destructive",
        });
        return;
      }

      await sendFriendRequest(friendProfile);
      setFriendCode('');
    } catch (error) {
      console.error('Error adding friend:', error);
    }
  };

  if (authLoading || profileLoading) {
    return (
      <div className="container mx-auto p-4 max-w-4xl">
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <User className="h-8 w-8 mx-auto mb-2 animate-pulse" />
            <p className="text-muted-foreground">Cargando perfil...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to auth
  }

  if (!profile) {
    return (
      <div className="container mx-auto p-4 max-w-4xl">
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">No se encontró el perfil</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={() => window.location.href = '/'}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver
        </Button>
      </div>
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Perfil
          </TabsTrigger>
          <TabsTrigger value="friends" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Amigos ({friends.length})
          </TabsTrigger>
          <TabsTrigger value="requests" className="flex items-center gap-2">
            <UserPlus className="h-4 w-4" />
            Solicitudes ({pendingRequests.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Mi Perfil
                <Button
                  variant={isEditing ? "default" : "outline"}
                  onClick={isEditing ? handleSaveProfile : () => setIsEditing(true)}
                >
                  {isEditing ? "Guardar" : "Editar"}
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Nombre</label>
                {isEditing ? (
                  <Input
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Tu nombre"
                  />
                ) : (
                  <p className="text-base">{profile.display_name || 'Sin nombre'}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Biografía</label>
                {isEditing ? (
                  <Textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Cuéntanos algo sobre ti..."
                    rows={3}
                  />
                ) : (
                  <p className="text-base text-muted-foreground">{profile.bio || 'Sin biografía'}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Tu Código LEFI</label>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-lg px-4 py-2 font-mono">
                    {profile.lefi_code}
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copyLefiCode}
                    className="flex items-center gap-1"
                  >
                    {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                    {copied ? "Copiado" : "Copiar"}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Comparte este código con tus amigos para que puedan agregarte
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Agregar Amigo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Input
                  value={friendCode}
                  onChange={(e) => setFriendCode(e.target.value)}
                  placeholder="Ingresa el código LEFI de tu amigo"
                  className="flex-1"
                />
                <Button onClick={handleAddFriend} disabled={!friendCode.trim()}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Agregar
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="friends" className="space-y-4">
          {friendsLoading ? (
            <div className="text-center py-8">
              <Users className="h-8 w-8 mx-auto mb-2 animate-pulse" />
              <p className="text-muted-foreground">Cargando amigos...</p>
            </div>
          ) : friends.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No tienes amigos aún</h3>
                <p className="text-muted-foreground mb-4">
                  Usa el código LEFI para agregar a tus primeros amigos
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {friends.map((friendship) => (
                <Card key={friendship.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold">{friendship.profile?.display_name}</h4>
                        <p className="text-sm text-muted-foreground">
                          Código: {friendship.profile?.lefi_code}
                        </p>
                        {friendship.profile?.bio && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {friendship.profile.bio}
                          </p>
                        )}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeFriend(friendship.id)}
                      >
                        Eliminar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="requests" className="space-y-4">
          {pendingRequests.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <UserPlus className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No tienes solicitudes pendientes</h3>
                <p className="text-muted-foreground">
                  Las nuevas solicitudes de amistad aparecerán aquí
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {pendingRequests.map((request) => (
                <Card key={request.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold">{request.profile?.display_name}</h4>
                        <p className="text-sm text-muted-foreground">
                          Código: {request.profile?.lefi_code}
                        </p>
                        {request.profile?.bio && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {request.profile.bio}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => acceptFriendRequest(request.id)}
                        >
                          <Check className="h-3 w-3 mr-1" />
                          Aceptar
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => rejectFriendRequest(request.id)}
                        >
                          <X className="h-3 w-3 mr-1" />
                          Rechazar
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}