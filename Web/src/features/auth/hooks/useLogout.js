import { useNavigate } from "react-router-dom";
import { supabase } from "../../../lib/supabase";
import useAuthStore from "../../../store/useAuthStore";

export default function useLogout() {
  const navigate = useNavigate();

  const { setUser, setProfile } = useAuthStore();

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setProfile(null);

      navigate("/", { replace: true });
    } catch (err) {
      console.error(err);
      alert("Logout failed");
    }
  };

  return { logout };
}