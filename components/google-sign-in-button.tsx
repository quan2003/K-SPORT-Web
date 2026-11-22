"use client";

import { useEffect, useRef, useState } from "react";

type GoogleButtonProps = {
  className: string;
  label?: string;
  redirectUrl?: string;
};

type GoogleApi = {
  accounts: {
    id: {
      initialize: (options: { client_id: string; callback: (response: { credential: string }) => void }) => void;
      renderButton: (element: HTMLElement, options: { theme: string; size: string; width: number; text: string }) => void;
    };
  };
};

declare global {
  interface Window { google?: GoogleApi; }
}

export function GoogleSignInButton({ className, label = "Tiếp tục với Google", redirectUrl = "/wkf-exam" }: GoogleButtonProps) {
  const target = useRef<HTMLDivElement>(null);
  const [error, setError] = useState("");
  const [sdkState, setSdkState] = useState<"idle" | "ready" | "error">("idle");
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID?.trim();

  useEffect(() => {
    if (!clientId || !target.current) return;
    let cancelled = false;

    const setup = () => {
      if (cancelled || !window.google?.accounts?.id || !target.current) return;
      try {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: async ({ credential }) => {
            try {
              setError("");
              const response = await fetch("/api/auth/google", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ credential }),
              });
              const payload = await response.json().catch(() => ({}));
              if (!response.ok || !payload.success) {
                throw new Error(payload.error || "Đăng nhập Google không thành công.");
              }
              window.location.assign(redirectUrl);
            } catch (reason) {
              setError(reason instanceof Error ? reason.message : "Đăng nhập Google không thành công.");
            }
          },
        });
        target.current.replaceChildren();
        const parentWidth = Math.floor(target.current.parentElement?.getBoundingClientRect().width || 0);
        const width = parentWidth > 0 ? Math.min(340, Math.max(220, parentWidth - 16)) : 320;
        window.google.accounts.id.renderButton(target.current, {
          theme: "outline",
          size: "large",
          width,
          text: "continue_with",
        });
        setSdkState("ready");
      } catch {
        setSdkState("error");
      }
    };

    const onError = () => {
      if (!cancelled) setSdkState("error");
    };

    if (window.google?.accounts?.id) {
      Promise.resolve().then(setup);
      return () => {
        cancelled = true;
      };
    }

    const existing = document.querySelector<HTMLScriptElement>('script[src="https://accounts.google.com/gsi/client"]');
    if (existing) {
      existing.addEventListener("load", setup);
      existing.addEventListener("error", onError);
      return () => {
        cancelled = true;
        existing.removeEventListener("load", setup);
        existing.removeEventListener("error", onError);
      };
    }

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = setup;
    script.onerror = onError;
    document.head.appendChild(script);
    return () => {
      cancelled = true;
      script.onload = null;
      script.onerror = null;
    };
  }, [clientId, redirectUrl]);

  if (!clientId || sdkState === "error") {
    const fallbackMessage = !clientId
      ? "Chưa cấu hình biến NEXT_PUBLIC_GOOGLE_CLIENT_ID trên máy chủ để bật đăng nhập Google."
      : "Không thể tải dịch vụ đăng nhập Google. Vui lòng kiểm tra kết nối mạng hoặc tắt trình chặn quảng cáo.";

    return (
      <div className="google-sign-in-control">
        <button
          type="button"
          className={className}
          onClick={() => setError(fallbackMessage)}
        >
          <GoogleMark />
          <span>{label}</span>
        </button>
        {error && (
          <p className="auth-message auth-message-error" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="google-sign-in-control">
      {sdkState === "idle" && (
        <button
          type="button"
          className={className}
          onClick={() => setError("Đang tải nút đăng nhập Google, vui lòng thử lại sau giây lát.")}
        >
          <GoogleMark />
          <span>{label}</span>
        </button>
      )}
      <div
        ref={target}
        style={{
          width: "100%",
          display: sdkState === "ready" ? "flex" : "none",
          justifyContent: "center",
          overflow: "hidden",
        }}
      />
      {error && (
        <p className="auth-message auth-message-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

function GoogleMark() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
    </svg>
  );
}
