import { createContext, ReactNode, useEffect, useState } from "react";
import { api } from "../services/api";

type AuthProvider = {
  children: ReactNode;
};

type User = {
  id: string;
  name: string;
  avatar_url: string;
  login: string;
};

type AuthContextData = {
  user: User | null;
  signInUrl: string;
  signOut: () => void;
};

type AuthResponse = {
  token: string;
  user: {
    id: string;
    name: string;
    avatar_url: string;
    login: string;
  };
};

export const AuthContext = createContext({} as AuthContextData);

export function AuthProvider(props: AuthProvider) {
  const [user, setUser] = useState<User | null>(null);
  const signInUrl = `https://github.com/login/oauth/authorize?scope=user&client_id=fcaa9244fdeac4c7c34f`;

  useEffect(() => {
    const url = window.location.href;
    const hasGithubCode = url.includes("?code=");

    if (hasGithubCode) {
      const [urlWithoutCode, githubCode] = url.split("?code=");
      window.history.pushState({}, "", urlWithoutCode);

      signIn(githubCode);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("@dowhile: token");

    if(token) {
        api.defaults.headers.common.authorization = `Bearer ${token}`;
        api.get<User>("profile").then(res => {
            setUser(res.data);
        });
    }
  }, []);

  async function signIn(githubCode: string) {
    const res = await api.post<AuthResponse>("authentication", {
      code: githubCode,
    });

    const { token, user } = res.data;
    localStorage.setItem("@dowhile: token", token);
    api.defaults.headers.common.authorization = `Bearer ${token}`;

    setUser(user);
  }

  function signOut() {
      setUser(null);
      localStorage.removeItem("@dowhile: token");
  }

  return (
    <AuthContext.Provider value={{ signInUrl, user , signOut}}>
        {props.children}
    </AuthContext.Provider>
  );
}
