import { create } from "zustand";
import { persist } from "zustand/middleware";

const useUserStore = create(
  persist(
    (set, get) => ({
      user: null,
      company: null,

      setUser: (user) => {
        console.log("Setting user in store:", user);
        set({ user });
      },

      setCompany: (company) => {
        console.log("Setting company in store:", company);
        set({ company });
      },

      setUserAndCompany: (userData) => {
        console.log("Setting user and company in store:", userData);
        if (userData.user && userData.company) {
          set({ 
            user: userData.user, 
            company: userData.company 
          });
        } else {
          // If data comes in flat format, extract company info
          const { company_code, company_name, schema_name, ...userInfo } = userData;
          if (company_code) {
            set({ 
              user: userInfo,
              company: { company_code, company_name, schema_name }
            });
          } else {
            set({ user: userData });
          }
        }
      },

      clearUser: () => {
        console.log("Clearing user from store");
        set({ user: null, company: null });
      },

      // Initialize user from server response
      initializeUser: (userData) => {
        if (userData) {
          console.log("Initializing user in store:", userData);
          
          // Handle both flat and nested response formats
          if (userData.user && userData.company) {
            set({ 
              user: userData.user, 
              company: userData.company 
            });
          } else {
            // Extract company info if it exists in flat format
            const { company_code, company_name, schema_name, ...userInfo } = userData;
            if (company_code) {
              set({ 
                user: userInfo,
                company: { company_code, company_name, schema_name }
              });
            } else {
              set({ user: userData });
            }
          }
        }
      },

      // Get current company
      getCompany: () => {
        const { company } = get();
        return company;
      },

      // Get company code
      getCompanyCode: () => {
        const { company } = get();
        return company?.company_code;
      },

      // Get schema name
      getSchemaName: () => {
        const { company } = get();
        return company?.schema_name;
      },

      // Check if user belongs to a specific company
      isFromCompany: (companyCode) => {
        const { company } = get();
        return company?.company_code === companyCode;
      },

      // Get user roles
      getUserRoles: () => {
        const { user } = get();
        return user?.roles || [];
      },

      // Check if user has a specific role
      hasRole: (roleName) => {
        const { user } = get();
        return user?.roles?.includes(roleName) || false;
      },

      // Check if user has any of the specified roles
      hasAnyRole: (roleNames) => {
        const { user } = get();
        if (!user?.roles) return false;
        return roleNames.some(role => user.roles.includes(role));
      },
    }),
    {
      name: "user-storage", // unique name for localStorage key
      partialize: (state) => ({ user: state.user, company: state.company }), // persist both user and company data
    }
  )
);

export default useUserStore;
