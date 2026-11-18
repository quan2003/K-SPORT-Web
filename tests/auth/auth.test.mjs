import assert from "node:assert/strict";
import test from "node:test";
import {
  authenticateWithPassword,
  authenticateWithGoogle,
  registerUser,
} from "../../lib/user-store.ts";

test("1. Seed users can authenticate successfully", () => {
  const admin = authenticateWithPassword("admin-k-sport", "Ksport!Quan_2026#");
  assert.ok(admin, "Admin must authenticate");
  assert.equal(admin.role, "admin");

  const btc = authenticateWithPassword("btc-phutho", "Ksport!Btc2026");
  assert.ok(btc, "BTC must authenticate");
  assert.equal(btc.role, "btc");

  const defaultUser = authenticateWithPassword("user.karate@k-sport.net", "Ksport!2026");
  assert.ok(defaultUser, "Default user must authenticate");
  assert.equal(defaultUser.role, "user");

  const maiUser = authenticateWithPassword("hocvien.karate@gmail.com", "Ksport!2026");
  assert.ok(maiUser, "User must authenticate");
  assert.equal(maiUser.role, "user");
});

test("2. User registration creates account with single user role and prevents duplicate email", () => {
  const testEmail = `test.user.${Date.now()}@gmail.com`;
  const registered = registerUser({
    name: "Võ Sĩ Thử Nghiệm",
    email: testEmail,
    password: "Password123#",
    clubOrUnit: "CLB Karate Hà Nội",
  });

  assert.ok(registered.id, "Registered user must have ID");
  assert.equal(registered.email, testEmail);
  assert.equal(registered.role, "user");

  // Attempt duplicate registration
  assert.throws(() => {
    registerUser({
      name: "Duplicate User",
      email: testEmail,
      password: "Password123#",
    });
  }, /đã được đăng ký/);

  // Authenticate with new account
  const authed = authenticateWithPassword(testEmail, "Password123#");
  assert.ok(authed, "Newly registered user must authenticate");
  assert.equal(authed.name, "Võ Sĩ Thử Nghiệm");
  assert.equal(authed.role, "user");
});

test("3. Google Sign-In creates or updates user profile with single user role", () => {
  const googleEmail = `google.karate.${Date.now()}@gmail.com`;
  const googleUser = authenticateWithGoogle({
    email: googleEmail,
    name: "Võ Sĩ Google",
    picture: "https://lh3.googleusercontent.com/avatar.jpg",
    googleId: "google-sub-12345",
  });

  assert.ok(googleUser.id.startsWith("google-"), "ID should have google prefix");
  assert.equal(googleUser.authProvider, "google");
  assert.equal(googleUser.email, googleEmail);
  assert.equal(googleUser.role, "user");

  // Existing user logging in again via Google
  const reLogin = authenticateWithGoogle({
    email: googleEmail,
    name: "Võ Sĩ Google Cập Nhật",
  });
  assert.equal(reLogin.id, googleUser.id);
  assert.equal(reLogin.name, "Võ Sĩ Google Cập Nhật");
  assert.equal(reLogin.role, "user");
});
