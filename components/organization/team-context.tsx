"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { authClient } from "@/lib/auth-client";

interface Team {
  id: string;
  name: string;
  role: string;
  createdAt: string;
  teamCreatedAt: string;
  teamUpdatedAt: string;
}

interface TeamContextType {
  activeTeam: Team | null;
  userTeams: Team[];
  isLoadingTeams: boolean;
  setActiveTeam: (team: Team | null) => void;
  refreshTeams: () => Promise<void>;
}

const TeamContext = createContext<TeamContextType | null>(null);

interface TeamProviderProps {
  children: ReactNode;
}

export function TeamProvider({ children }: TeamProviderProps) {
  const [activeTeam, setActiveTeamState] = useState<Team | null>(null);
  const [userTeams, setUserTeams] = useState<Team[]>([]);
  const [isLoadingTeams, setIsLoadingTeams] = useState(false);

  const { data: activeOrganization } = authClient.useActiveOrganization();

  // Fetch user teams for the active organization
  const fetchUserTeams = async (organizationId: string) => {
    setIsLoadingTeams(true);
    try {
      const response = await fetch(
        `/api/organization/user-teams?organizationId=${organizationId}`,
        {
          credentials: "include",
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setUserTeams(data.teams);

          // Try to restore active team from localStorage
          const savedTeamId = localStorage.getItem(
            `activeTeam_${organizationId}`
          );
          const savedTeam = data.teams.find(
            (team: Team) => team.id === savedTeamId
          );
          setActiveTeamState(savedTeam || null);
        }
      }
    } catch (error) {
      console.error("Error fetching user teams:", error);
    } finally {
      setIsLoadingTeams(false);
    }
  };

  // Load teams when active organization changes
  useEffect(() => {
    if (activeOrganization?.id) {
      fetchUserTeams(activeOrganization.id);
    } else {
      setUserTeams([]);
      setActiveTeamState(null);
    }
  }, [activeOrganization?.id]);

  const setActiveTeam = (team: Team | null) => {
    setActiveTeamState(team);

    if (activeOrganization?.id) {
      if (team) {
        localStorage.setItem(`activeTeam_${activeOrganization.id}`, team.id);
      } else {
        localStorage.removeItem(`activeTeam_${activeOrganization.id}`);
      }
    }
  };

  const refreshTeams = async () => {
    if (activeOrganization?.id) {
      await fetchUserTeams(activeOrganization.id);
    }
  };

  return (
    <TeamContext.Provider
      value={{
        activeTeam,
        userTeams,
        isLoadingTeams,
        setActiveTeam,
        refreshTeams,
      }}
    >
      {children}
    </TeamContext.Provider>
  );
}

export function useTeamContext(): TeamContextType {
  const context = useContext(TeamContext);
  if (!context) {
    throw new Error("useTeamContext must be used within a TeamProvider");
  }
  return context;
}
