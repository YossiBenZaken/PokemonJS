import flagsmith from "flagsmith";
import React, { createContext, useContext, ReactNode, useCallback, useState, useEffect } from "react";
import type { IFlags, IState } from "flagsmith";

interface FlagsmithContextValue {
  flagsmith: typeof flagsmith;
  isReady: boolean;
  flags: IFlags;
  userId: string | null;
  identifyUser: (
    userIdentifier: string,
    traits?: Record<string, any>
  ) => Promise<boolean>;
  logout: () => Promise<boolean>;
  hasFeature: (featureName: string) => boolean;
  getValue: <T = string>(featureName: string, defaultValue?: T) => T;
  isFeatureEnabled: (featureName: string) => boolean;
}

const FlagsmithContext = createContext<FlagsmithContextValue | null>(null);

interface FlagsmithProviderProps {
  children: ReactNode;
  environmentKey: string;
}

interface UserTraits {
  [key: string]: any;
}

export const FlagsmithProvider: React.FC<FlagsmithProviderProps> = ({
  children,
  environmentKey,
}) => {
const [isReady, setIsReady] = useState<boolean>(false);
  const [flags, setFlags] = useState<IFlags>({});
  const [userId, setUserId] = useState<string | null>(null);

  // אתחול ראשוני של Flagsmith (ללא זיהוי משתמש)
  useEffect(() => {
    flagsmith.init({
      environmentID: environmentKey,
      onChange: () => {
        setFlags(flagsmith.getAllFlags());
      },
    }).then(() => {
      setFlags(flagsmith.getAllFlags());
      setIsReady(true);
    });
  }, [environmentKey]);

  // פונקציה לזיהוי משתמש אחרי התחברות
  const identifyUser = useCallback(async (
    userIdentifier: string, 
    traits: UserTraits = {}
  ): Promise<boolean> => {
    try {
      await flagsmith.identify(userIdentifier, traits);
      setUserId(userIdentifier);
      setFlags(flagsmith.getAllFlags());
      return true;
    } catch (error) {
      console.error('Failed to identify user:', error);
      return false;
    }
  }, []);

  // פונקציה להתנתקות (חזרה לflags כלליים)
  const logout = useCallback(async (): Promise<boolean> => {
    try {
      await flagsmith.logout();
      setUserId(null);
      setFlags(flagsmith.getAllFlags());
      return true;
    } catch (error) {
      console.error('Failed to logout:', error);
      return false;
    }
  }, []);

  // Helper functions לעבודה עם flags
  const hasFeature = useCallback((featureName: string): boolean => {
    return flagsmith.hasFeature(featureName);
  }, [flags]);

    const isFeatureEnabled = useCallback((featureName: string): boolean => {
    return flagsmith.hasFeature(featureName) && 
           flagsmith.getValue(featureName) !== 'false';
  }, [flags]);

  const getValue = useCallback((
    featureName: string, 
    defaultValue?: any
  ): any => {
    const value = flagsmith.getValue(featureName);
    if (value === null || value === undefined) {
      return defaultValue;
    }
    return value;
  }, [flags]);

  const value: FlagsmithContextValue = {
    flagsmith,
    isReady,
    flags,
    userId,
    identifyUser,
    logout,
    hasFeature,
    getValue,
    isFeatureEnabled,
  };

  return (
    <FlagsmithContext.Provider value={value}>
      {children}
    </FlagsmithContext.Provider>
  );
};

export function useFlagsmith(): FlagsmithContextValue {
  const context = useContext(FlagsmithContext);
  if (!context) {
    throw new Error('useFlagsmith must be used within FlagsmithProvider');
  }
  return context;
}