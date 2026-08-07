import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../../lib/supabase";
import useAuthStore from "../../../store/useAuthStore";

export default function useLogin() {
  const navigate = useNavigate();

  const { setUser, setProfile } = useAuthStore();

  const [loading, setLoading] = useState(false);

  const login = async (email, password) => {
    try {
      setLoading(true);

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error("User not found");

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profileError) throw profileError;

      if (profile.role !== "admin") {
        await supabase.auth.signOut();
        throw new Error("Only admins can login.");
      }

      setUser(user);
      setProfile(profile);

      console.log("Before navigate");
      navigate("/dashboard");
      console.log("After navigate");
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  

  return {
    login,
    loading,
  };
}
