import { db, isFirebaseConfigured } from "../firebase";
import { collection, addDoc, getDocs, query, where, orderBy, limit } from "firebase/firestore";

const LOCAL_STORAGE_KEY = "quiz_leaderboard_data";

// Helper to retrieve leaderboard from LocalStorage for a specific quiz
const getLocalStorageLeaderboard = (quizId) => {
  try {
    const data = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!data) return [];
    const parsed = JSON.parse(data);
    
    // Filter by quiz (if provided) and sort: 
    // 1. By score (descending)
    // 2. By completedAt (descending - latest completion time first)
    return parsed
      .filter((entry) => !quizId || entry.quizId === quizId)
      .sort((a, b) => {
        if (b.score !== a.score) {
          return b.score - a.score;
        }
        return new Date(b.completedAt) - new Date(a.completedAt);
      })
      .slice(0, 10);
  } catch (error) {
    console.error("Failed to read local leaderboard:", error);
    return [];
  }
};

// Helper to save entry to LocalStorage
const saveToLocalStorage = (entry) => {
  try {
    const data = localStorage.getItem(LOCAL_STORAGE_KEY);
    const parsed = data ? JSON.parse(data) : [];
    parsed.push(entry);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(parsed));
  } catch (error) {
    console.error("Failed to write to local leaderboard:", error);
  }
};

/**
 * Saves a user score entry to the database.
 * Falls back to LocalStorage if Firebase is not configured or fails.
 */
export const saveLeaderboardEntry = async (entry) => {
  const finalEntry = {
    ...entry,
    completedAt: entry.completedAt || new Date().toISOString()
  };

  if (isFirebaseConfigured && db) {
    try {
      const docRef = await addDoc(collection(db, "leaderboard"), finalEntry);
      console.log("Leaderboard entry saved to Firestore. ID:", docRef.id);
      return { success: true, mode: "firestore" };
    } catch (error) {
      console.error("Firestore write failed, falling back to LocalStorage:", error);
      saveToLocalStorage(finalEntry);
      return { success: true, mode: "local_fallback" };
    }
  } else {
    saveToLocalStorage(finalEntry);
    return { success: true, mode: "local" };
  }
};

/**
 * Retrieves the Top 10 leaderboard entries for a given quiz ID.
 * Falls back to LocalStorage if Firebase is not configured or fails.
 */
export const getLeaderboard = async (quizId) => {
  if (isFirebaseConfigured && db) {
    try {
      const leaderboardRef = collection(db, "leaderboard");
      let q;
      if (quizId) {
        q = query(
          leaderboardRef,
          where("quizId", "==", quizId),
          orderBy("score", "desc"),
          orderBy("completedAt", "desc"),
          limit(10)
        );
      } else {
        q = query(
          leaderboardRef,
          orderBy("score", "desc"),
          orderBy("completedAt", "desc"),
          limit(10)
        );
      }
      
      const querySnapshot = await getDocs(q);
      const results = [];
      querySnapshot.forEach((doc) => {
        results.push({ id: doc.id, ...doc.data() });
      });
      return results;
    } catch (error) {
      console.error("Firestore read failed, falling back to LocalStorage:", error);
      return getLocalStorageLeaderboard(quizId);
    }
  } else {
    return getLocalStorageLeaderboard(quizId);
  }
};
