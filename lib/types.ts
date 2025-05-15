// types.ts
export interface User {
    id: string;
    name: string;
    email: string;
    username: string;
    password: string;
    profile_picture?: string;
    is_active: boolean;
  }
  
  export interface Role {
    id: string;
    name: string;
  }
  
  export interface UserRole {
    id: string;
    user_id: string;
    role_id: string;
  }
  
  export interface Permission {
    id: string;
    name: string;
  }
  
  export interface RolePermission {
    id: string;
    role_id: string;
    permission_id: string;
    permission?: Permission;
  }
  
  export interface AuthenticatedUser {
    id: string;
    name: string;
    email: string;
    username: string;
    role: string;
    permissions: string[];
    profilePicture?: string;
    isActive: boolean;
  }