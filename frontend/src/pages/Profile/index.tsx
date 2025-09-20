import {
  Activity,
  ArrowLeft,
  Calendar,
  Coins,
  Globe,
  Heart,
  Medal,
  Shield,
  Star,
  Target,
  Trophy,
  Zap,
} from "lucide-react";
import {
  Container,
  ErrorMessage,
  LoadingSpinner,
  MoneyCard,
  ProfileAvatar,
  ProfileBadge,
  ProfileButton,
  ProfileCard,
  ProfileGrid,
  ProfileHeader,
  ProfileInfo,
  ProfileSection,
  ProfileStats,
} from "./styled";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { getUserProfile } from "../../api/character.api";

export const ProfilePage: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await getUserProfile(username!);
        if (response.success) {
          setProfile(response.data);
        }
      } catch (error: any) {
        setError(error.response?.data?.message || "שגיאה בטעינת הפרופיל");
      } finally {
        setIsLoading(false);
      }
    };
    if (username) {
      loadProfile();
    }
  }, [username]);

  const getCharacterImage = (characterName: string) => {
    try {
      return require(`../../assets/images/characters/${characterName}/npc.png`);
    } catch {
      return "/images/characters/default.png";
    }
  };

  if (isLoading) {
    return (
      <Container>
        <LoadingSpinner />
        <span>טוען פרופיל...</span>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <ErrorMessage>
          <h2>שגיאה</h2>
          <p>{error}</p>
          <ProfileButton onClick={() => navigate("/")}>
            <ArrowLeft size={20} />
            חזור לדף הבית
          </ProfileButton>
        </ErrorMessage>
      </Container>
    );
  }

  if (!profile) {
    return (
      <Container>
        <ErrorMessage>
          <h2>פרופיל לא נמצא</h2>
          <p>המשתמש {username} לא נמצא במערכת</p>
          <ProfileButton onClick={() => navigate("/")}>
            <ArrowLeft size={20} />
            חזור לדף הבית
          </ProfileButton>
        </ErrorMessage>
      </Container>
    );
  }

  return (
    <Container>
      <ProfileCard>
        <ProfileHeader>
          <ProfileAvatar>
            <img
              src={getCharacterImage(profile.profile.character)}
              alt={profile.profile.username}
            />
          </ProfileAvatar>
          <ProfileInfo>
            <h1>{profile.profile.username}</h1>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                marginBottom: "1rem",
              }}
            >
              {profile.profile.admin > 0 && (
                <ProfileBadge style={{ backgroundColor: "#e74c3c" }}>
                  <Shield size={16} />
                  מנהל
                </ProfileBadge>
              )}
              {profile.profile.premiumaccount > Date.now() && (
                <ProfileBadge style={{ backgroundColor: "#f39c12" }}>
                  <Star size={16} />
                  פרימיום
                </ProfileBadge>
              )}
              <ProfileBadge
                style={{
                  backgroundColor:
                    profile.onlineStatus === "online" ? "#27ae60" : "#95a5a6",
                }}
              >
                <div
                  style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    backgroundColor: "white",
                    marginRight: "0.5rem",
                  }}
                />
                {profile.onlineStatus === "online" ? "מחובר" : "מנותק"}
              </ProfileBadge>
            </div>
            <p>
              <Globe size={16} /> עולם: {profile.profile.wereld}
            </p>
            <p>
              <Calendar size={16} /> נוצר: {profile.formatted.date}
            </p>
          </ProfileInfo>
        </ProfileHeader>

        <ProfileStats>
          <div className="stat-item">
            <Trophy size={20} />
            <span>דירוג: {profile.rankMedal.text}</span>
            {profile.rankMedal.medal && (
              <img
                src={profile.rankMedal.medal}
                alt="medal"
                style={{ width: "20px", height: "20px" }}
              />
            )}
          </div>
          <div className="stat-item">
            <Heart size={20} />
            <span>תגים: {profile.profile.badges}</span>
          </div>
          <div className="stat-item">
            <Target size={20} />
            <span>פוקימונים: {profile.stats.inHouse}</span>
          </div>
          <div className="stat-item">
            <Activity size={20} />
            <span>ניצחונות: {profile.profile.gewonnen}</span>
          </div>
        </ProfileStats>

        <ProfileSection>
          <h2>סטטיסטיקות מתקדמות</h2>
          <ProfileGrid>
            <div className="stat-card">
              <Zap size={24} />
              <h3>פוקימונים רמה 100</h3>
              <span className="stat-value">{profile.stats.pokes100}</span>
            </div>
            <div className="stat-card">
              <Medal size={24} />
              <h3>טופ 3</h3>
              <span className="stat-value">{profile.stats.top3}</span>
            </div>
            <div className="stat-card">
              <Medal size={24} />
              <h3>טופ 2</h3>
              <span className="stat-value">{profile.stats.top2}</span>
            </div>
            <div className="stat-card">
              <Medal size={24} />
              <h3>טופ 1</h3>
              <span className="stat-value">{profile.stats.top1}</span>
            </div>
          </ProfileGrid>
        </ProfileSection>

        <ProfileSection>
          <h2>כלכלה</h2>
          <div
            style={{ display: "flex", gap: "2rem", justifyContent: "center" }}
          >
            <MoneyCard>
              <Coins size={24} />
              <h3>כסף</h3>
              <span className="money-value">{profile.formatted.silver}</span>
            </MoneyCard>
            <MoneyCard>
              <Star size={24} />
              <h3>זהב</h3>
              <span className="money-value">{profile.formatted.gold}</span>
            </MoneyCard>
          </div>
        </ProfileSection>

        <ProfileSection>
          <h2>פוקימוני הקבוצה</h2>
          <div
            style={{
              display: "flex",
              gap: "1rem",
              justifyContent: "center",
              flexWrap: "wrap",
              marginTop: "1rem",
            }}
          >
            {profile.teamPokemon?.map((pokemon: any, index: number) => (
              <div
                key={index}
                style={{
                  width: "80px",
                  height: "80px",
                  border: "2px solid #ddd",
                  borderRadius: "8px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "#f8f9fa",
                  position: "relative",
                }}
              >
                <img
                  src={require("../../assets/images/" +
                    (pokemon.shiny === 1 ? "shiny" : "pokemon") +
                    "/" +
                    pokemon.wild_id +
                    ".gif")}
                  alt={pokemon.naam || `Pokemon ${index + 1}`}
                  style={{
                    width: "60px",
                    height: "60px",
                    objectFit: "contain",
                  }}
                />

                {pokemon.level && (
                  <div
                    style={{
                      position: "absolute",
                      bottom: "2px",
                      right: "2px",
                      backgroundColor: "#007bff",
                      color: "white",
                      fontSize: "10px",
                      padding: "2px 4px",
                      borderRadius: "3px",
                    }}
                  >
                    {pokemon.level}
                  </div>
                )}
              </div>
            ))}
            {[...Array(6 - (profile.teamPokemon?.length || 0))].map(
              (_, index) => (
                <div
                  key={`empty-${index}`}
                  className="icon"
                  style={{
                    width: "80px",
                    height: "80px",
                    border: "2px dashed #ddd",
                    borderRadius: "8px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "#f8f9fa",
                    color: "#6c757d",
                    fontSize: "12px",
                  }}
                >
                  ריק
                </div>
              )
            )}
          </div>
        </ProfileSection>

        <ProfileButton onClick={() => navigate("/")}>
          <ArrowLeft size={20} />
          חזור לדף הבית
        </ProfileButton>
      </ProfileCard>
    </Container>
  );
};
