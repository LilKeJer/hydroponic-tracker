import { supabase } from "./client";
import Cookies from "js-cookie";

export async function signInWithPassword(password: string) {
  // Cek password di table users
  const { data, error } = await supabase
    .from("users")
    .select()
    .eq("password", password)
    .single();

  if (error || !data) {
    throw new Error("Kata sandi salah");
  }

  // Simpan informasi user di cookie dan localStorage (double backup)
  const userData = JSON.stringify(data);
  Cookies.set("user", userData, { expires: 7 }); // Expired dalam 7 hari
  localStorage.setItem("user", userData);

  return data;
}

export function signOut() {
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

  // Jika ada, parse dan kembalikan
  if (userData) {
    try {
      const user = JSON.parse(userData);
      return user;
    } catch {
      // Catch parsing error but don't reference the error object
      return null;
    }
  }

  return null;
}

export function isAuthenticated() {
  return !!getCurrentUser();
}
