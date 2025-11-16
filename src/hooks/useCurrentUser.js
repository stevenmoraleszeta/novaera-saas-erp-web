import useUserStore from "@/stores/userStore";

export default function useCurrentUser() {
  const { user } = useUserStore();
  return user;
}
