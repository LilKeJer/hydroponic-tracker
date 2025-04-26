import { supabase } from "./client";
import Cookies from "js-cookie";

export async function signInWithPassword(password: string) {
  try {
    console.log("Attempting to login with password");

    // Versi lebih sederhana tanpa seleksi kolom spesifik
    const { data, error } = await supabase
      .from("users")
      .select()
      .eq("password", password)
      .single();

    console.log("Login response:", { data, error });

    if (error) {
      console.error("Supabase error:", error);
      throw new Error(error.message || "Kata sandi salah");
    }

    if (!data) {
      throw new Error("Kata sandi salah");
    }

    // Simpan informasi user di cookie dan localStorage (double backup)
    const userData = JSON.stringify(data);
    Cookies.set("user", userData, { expires: 7 }); // Expired dalam 7 hari
    localStorage.setItem("user", userData);

    console.log("User data saved to cookies and localStorage");

    return data;
  } catch (err) {
    console.error("Login error:", err);
    throw err;
  }
}

export function signOut() {
  console.log("Signing out");
  Cookies.remove("user");
  localStorage.removeItem("user");
  return true;
}

export function getCurrentUser() {
  // Coba ambil dari cookie dulu
  const userFromCookie = Cookies.get("user");

  // Jika tidak ada di cookie, coba dari localStorage
  const userFromLocalStorage = localStorage.getItem("user");

  const userData = userFromCookie || userFromLocalStorage;
  console.log(
    "getCurrentUser data source:",
    userFromCookie
      ? "cookie"
      : userFromLocalStorage
      ? "localStorage"
      : "not found"
  );

  // Jika ada, parse dan kembalikan
  if (userData) {
    try {
      const user = JSON.parse(userData);
      return user;
    } catch (e) {
      console.error("Error parsing user data:", e);
      return null;
    }
  }

  return null;
}

export function isAuthenticated() {
  return !!getCurrentUser();
}

// Fungsi untuk demo autentikasi lokal jika Supabase bermasalah
export async function signInLocally(password: string) {
  // Hanya untuk debugging selama development
  if (password === "hidroponik") {
    const mockUser = {
      id: "local-user-id",
      username: "demo",
      password: "hidden", // Jangan simpan password asli
    };

    const userData = JSON.stringify(mockUser);
    Cookies.set("user", userData, { expires: 7 });
    localStorage.setItem("user", userData);

    console.log("Mock user saved to cookies and localStorage");

    return mockUser;
  }

  throw new Error("Kata sandi salah");
}
