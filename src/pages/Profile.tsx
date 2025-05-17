
import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { User, LogOut } from "lucide-react";
import { useForm } from "react-hook-form";

const Profile = () => {
  const { profile, user, updateProfile, signOut } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    defaultValues: {
      username: profile?.username || "",
      avatar_url: profile?.avatar_url || "",
    }
  });

  const onSubmit = async (data: any) => {
    try {
      await updateProfile(data);
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  if (!user || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-game-darker">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-game-orange"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-game-darker pt-24">
      <div className="game-container max-w-3xl mx-auto px-4 py-8">
        <div className="bg-game-dark border border-white/10 rounded-lg shadow-xl overflow-hidden">
          <div className="p-8 md:p-12 flex flex-col items-center md:items-start md:flex-row md:space-x-8">
            <div className="mb-6 md:mb-0">
              <Avatar className="h-28 w-28 md:h-36 md:w-36 border-2 border-game-orange">
                <AvatarImage src={profile.avatar_url} alt={profile.username} />
                <AvatarFallback className="bg-game-gray text-xl">
                  {profile.username?.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>
            
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl font-bold text-white mb-2">{profile.username}</h1>
              <div className="flex items-center justify-center md:justify-start mb-4">
                <span className="px-2 py-1 bg-game-gray/30 text-game-orange text-xs uppercase rounded">
                  {profile.role}
                </span>
                <span className="ml-2 text-sm text-gray-400">
                  Member since {new Date(profile.created_at).toLocaleDateString()}
                </span>
              </div>
              <div className="flex flex-col md:flex-row gap-4 mt-4">
                <Button 
                  variant="outline" 
                  className="border-white/20 hover:border-white/40"
                  onClick={() => setIsEditing(!isEditing)}
                >
                  {isEditing ? "Cancel" : "Edit Profile"}
                </Button>
                <Button 
                  variant="ghost" 
                  className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                  onClick={signOut}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            </div>
          </div>
          
          {isEditing && (
            <div className="px-8 pb-8 md:px-12 md:pb-12 pt-0 border-t border-white/10">
              <h2 className="text-xl font-semibold text-white mb-4">Edit Profile</h2>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label htmlFor="username" className="block text-sm text-gray-400 mb-1">Username</label>
                  <Input
                    id="username"
                    className="bg-game-gray/30 border-white/10 text-white"
                    {...register("username", { required: "Username is required" })}
                  />
                  {errors.username && (
                    <p className="text-red-400 text-xs mt-1">{errors.username.message as string}</p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="avatar_url" className="block text-sm text-gray-400 mb-1">Avatar URL</label>
                  <Input
                    id="avatar_url"
                    className="bg-game-gray/30 border-white/10 text-white"
                    {...register("avatar_url")}
                  />
                  <p className="text-xs text-gray-500 mt-1">Leave empty to use default avatar</p>
                </div>
                
                <div className="pt-2">
                  <Button 
                    type="submit" 
                    className="bg-game-orange hover:bg-game-orange/80"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
