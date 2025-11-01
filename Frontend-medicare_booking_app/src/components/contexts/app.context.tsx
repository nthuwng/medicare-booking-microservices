import { fetchAccountAPI } from "@/services/api";
import { createContext, useContext, useEffect, useState } from "react";
import Lottie from "lottie-react";
import animationData from "@/assets/lotties/DoctorLoading.json";

interface IAppContext {
  isAuthenticated: boolean;
  setIsAuthenticated: (v: boolean) => void;
  setUser: (v: IUser | null) => void;
  user: IUser | null;
  isAppLoading: boolean;
  setIsAppLoading: (v: boolean) => void;
  refreshUserData: () => Promise<void>;
  theme: ThemeContextType;
  setTheme: (v: ThemeContextType) => void;
}

type ThemeContextType = "light" | "dark";

const CurrentAppContext = createContext<IAppContext | null>(null);

type TProps = {
  children: React.ReactNode;
};

export const AppProvider = (props: TProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<IUser | null>(null);
  const [isAppLoading, setIsAppLoading] = useState<boolean>(true);
  const [theme, setTheme] = useState<ThemeContextType>(() => {
    const initialTheme =
      (localStorage.getItem("theme") as ThemeContextType) || "light";
    return initialTheme;
  });

 // ...các import cũ
useEffect(() => {
  const root = document.documentElement;
  // Tailwind dark-mode class
  if (theme === "dark") root.classList.add("dark");
  else root.classList.remove("dark");

  // Gắn class :root.dark cho CSS variables
  if (theme === "dark") root.classList.add("dark"); // giữ cho tailwind
  // đồng thời set attribute tùy ý nếu bạn muốn check khác
  root.setAttribute("data-bs-theme", theme);

  // đổi <meta name="theme-color"> cho mobile address bar
  const meta = document.querySelector('meta[name="theme-color"]') as HTMLMetaElement | null;
  if (meta) meta.content = theme === "dark" ? "#0b1220" : "#f7f9fc";

  localStorage.setItem("theme", theme);
}, [theme]);


  const fetchAccount = async () => {
    try {
      const res = await fetchAccountAPI();
      if (res.data) {
        setUser(res.data.user);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.log("Error fetching account:", error);
      setIsAuthenticated(false);
      setUser(null);
    }
  };

  const refreshUserData = async () => {
    await fetchAccount();
  };

  useEffect(() => {
    const initApp = async () => {
      const delay = new Promise((resolve) => setTimeout(resolve, 1500));
      await fetchAccount();
      await delay;
      setIsAppLoading(false);
    };

    initApp();
  }, []);

  return (
    <>
      {isAppLoading === false ? (
        <CurrentAppContext.Provider
          value={{
            isAuthenticated,
            user,
            setIsAuthenticated,
            setUser,
            isAppLoading,
            setIsAppLoading,
            refreshUserData,
            theme,
            setTheme,
          }}
        >
          {props.children}
        </CurrentAppContext.Provider>
      ) : (
        <div
          style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          }}
        >
          <Lottie animationData={animationData} />
        </div>
      )}
    </>
  );
};
export const useCurrentApp = () => {
  const currentAppContext = useContext(CurrentAppContext);

  if (!currentAppContext) {
    throw new Error(
      "useCurrentApp has to be used within <CurrentAppContext.Provider>"
    );
  }

  return currentAppContext;
};
