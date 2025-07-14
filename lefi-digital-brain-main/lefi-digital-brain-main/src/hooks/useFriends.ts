import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Profile } from './useProfile';

export interface Friendship {
  id: string;
  user_id: string;
  friend_id: string;
  status: 'pending' | 'accepted' | 'blocked';
  created_at: string;
  updated_at: string;
  profile?: Profile;
}

export const useFriends = () => {
  const [friends, setFriends] = useState<Friendship[]>([]);
  const [pendingRequests, setPendingRequests] = useState<Friendship[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchFriends = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch accepted friendships where current user initiated
      const { data: friendships, error } = await supabase
        .from('friendships')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'accepted');

      if (error) throw error;

      // Also fetch friendships where current user is the friend
      const { data: reverseFriendships, error: reverseError } = await supabase
        .from('friendships')
        .select('*')
        .eq('friend_id', user.id)
        .eq('status', 'accepted');

      if (reverseError) throw reverseError;

      // Get profiles for all friends
      const friendIds = [
        ...(friendships || []).map(f => f.friend_id),
        ...(reverseFriendships || []).map(f => f.user_id)
      ];

      if (friendIds.length > 0) {
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('*')
          .in('user_id', friendIds);

        if (profilesError) throw profilesError;

        // Combine friendships with profiles
        const friendsWithProfiles = [
          ...(friendships || []).map(f => ({
            ...f,
            profile: profiles?.find(p => p.user_id === f.friend_id)
          })),
          ...(reverseFriendships || []).map(f => ({
            ...f,
            user_id: f.friend_id,
            friend_id: f.user_id,
            profile: profiles?.find(p => p.user_id === f.user_id)
          }))
        ] as Friendship[];

        setFriends(friendsWithProfiles);
      } else {
        setFriends([]);
      }

      // Fetch pending requests (where current user is the friend)
      const { data: pendingData, error: pendingError } = await supabase
        .from('friendships')
        .select('*')
        .eq('friend_id', user.id)
        .eq('status', 'pending');

      if (pendingError) throw pendingError;

      if (pendingData && pendingData.length > 0) {
        const requestUserIds = pendingData.map(p => p.user_id);
        const { data: requestProfiles, error: requestProfilesError } = await supabase
          .from('profiles')
          .select('*')
          .in('user_id', requestUserIds);

        if (requestProfilesError) throw requestProfilesError;

        const requestsWithProfiles = pendingData.map(request => ({
          ...request,
          status: request.status as 'pending' | 'accepted' | 'blocked',
          profile: requestProfiles?.find(p => p.user_id === request.user_id)
        })) as Friendship[];

        setPendingRequests(requestsWithProfiles);
      } else {
        setPendingRequests([]);
      }

    } catch (error) {
      console.error('Error fetching friends:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendFriendRequest = async (friendProfile: Profile) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      if (user.id === friendProfile.user_id) {
        toast({
          title: "Error",
          description: "No puedes agregarte a ti mismo como amigo",
          variant: "destructive",
        });
        return;
      }

      // Check if friendship already exists
      const { data: existingFriendship } = await supabase
        .from('friendships')
        .select('*')
        .or(`and(user_id.eq.${user.id},friend_id.eq.${friendProfile.user_id}),and(user_id.eq.${friendProfile.user_id},friend_id.eq.${user.id})`)
        .single();

      if (existingFriendship) {
        toast({
          title: "Error",
          description: "Ya existe una solicitud de amistad con este usuario",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('friendships')
        .insert({
          user_id: user.id,
          friend_id: friendProfile.user_id,
          status: 'pending'
        });

      if (error) throw error;

      toast({
        title: "Solicitud enviada",
        description: `Solicitud de amistad enviada a ${friendProfile.display_name}`,
      });

      await fetchFriends();
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo enviar la solicitud de amistad",
        variant: "destructive",
      });
    }
  };

  const acceptFriendRequest = async (friendshipId: string) => {
    try {
      const { error } = await supabase
        .from('friendships')
        .update({ status: 'accepted' })
        .eq('id', friendshipId);

      if (error) throw error;

      toast({
        title: "Solicitud aceptada",
        description: "¡Ahora son amigos!",
      });

      await fetchFriends();
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo aceptar la solicitud",
        variant: "destructive",
      });
    }
  };

  const rejectFriendRequest = async (friendshipId: string) => {
    try {
      const { error } = await supabase
        .from('friendships')
        .delete()
        .eq('id', friendshipId);

      if (error) throw error;

      toast({
        title: "Solicitud rechazada",
        description: "La solicitud de amistad fue rechazada",
      });

      await fetchFriends();
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo rechazar la solicitud",
        variant: "destructive",
      });
    }
  };

  const removeFriend = async (friendshipId: string) => {
    try {
      const { error } = await supabase
        .from('friendships')
        .delete()
        .eq('id', friendshipId);

      if (error) throw error;

      toast({
        title: "Amigo eliminado",
        description: "El amigo fue eliminado de tu lista",
      });

      await fetchFriends();
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar el amigo",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchFriends();
  }, []);

  return {
    friends,
    pendingRequests,
    loading,
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    removeFriend,
    refetch: fetchFriends
  };
};