"use client";

import { ClipboardEvent, FormEvent, KeyboardEvent, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

const CODE_LENGTH = 6;

function CodeBoxes({
  label,
  value,
  onChange,
  disabled,
  describedBy,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled: boolean;
  describedBy: string;
}) {
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const digits = Array.from({ length: CODE_LENGTH }, (_, index) => value[index] || "");

  function updateDigit(index: number, nextValue: string) {
    const digit = nextValue.replace(/\D/g, "").slice(-1);
    const next = digits.slice();
    next[index] = digit;
    onChange(next.join(""));
    if (digit && index < CODE_LENGTH - 1) inputRefs.current[index + 1]?.focus();
  }

  function handleKeyDown(index: number, event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Backspace" && !digits[index] && index > 0) {
      event.preventDefault();
      const next = digits.slice();
      next[index - 1] = "";
      onChange(next.join(""));
      inputRefs.current[index - 1]?.focus();
    }
    if (event.key === "ArrowLeft" && index > 0) inputRefs.current[index - 1]?.focus();
    if (event.key === "ArrowRight" && index < CODE_LENGTH - 1) inputRefs.current[index + 1]?.focus();
  }

  function handlePaste(event: ClipboardEvent<HTMLInputElement>) {
    event.preventDefault();
    const pasted = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, CODE_LENGTH);
    if (!pasted) return;
    onChange(pasted);
    inputRefs.current[Math.min(pasted.length, CODE_LENGTH) - 1]?.focus();
  }

  return <fieldset className="license-code-fieldset" aria-describedby={describedBy}>
    <legend>{label}</legend>
    <div className="license-code-boxes">
      {digits.map((digit, index) => <input
        key={`${label}-${index}`}
        ref={(element) => { inputRefs.current[index] = element; }}
        aria-label={`${label}, số ${index + 1} trên ${CODE_LENGTH}`}
        className="license-code-box"
        type="text"
        inputMode="numeric"
        autoComplete={index === 0 ? "one-time-code" : "off"}
        pattern="[0-9]"
        maxLength={1}
        value={digit}
        onChange={(event) => updateDigit(index, event.target.value)}
        onKeyDown={(event) => handleKeyDown(index, event)}
        onPaste={handlePaste}
        autoFocus={index === 0}
        disabled={disabled}
      />)}
    </div>
  </fieldset>;
}

export function LicenseAccessGate() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [mode, setMode] = useState<"checking" | "setup" | "verify">("checking");
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);
  useEffect(() => {
    void fetch("/api/admin/licenses/access", { cache: "no-store" }).then(async (response) => {
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) { setMessage(payload.message || "Không thể kiểm tra passcode."); setMode("verify"); return; }
      setMode(payload.configured ? "verify" : "setup");
    }).catch(() => { setMessage("Không thể kiểm tra passcode."); setMode("verify"); });
  }, []);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setMessage("");
    if (!/^\d{6}$/.test(code)) return setMessage("Nhập đủ 6 chữ số.");
    if (mode === "setup" && code !== confirmation) return setMessage("Hai lần nhập passcode chưa khớp.");
    setPending(true);
    const response = await fetch("/api/admin/licenses/access", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ mode, passcode: code, confirmation }) });
    const payload = await response.json().catch(() => ({})); setPending(false);
    if (!response.ok) { setMessage(payload.message || "Không thể xác thực mã."); setCode(""); return; }
    router.refresh();
  }
  const settingUp = mode === "setup";
  const isChecking = mode === "checking";
  return <section className="license-gate" aria-labelledby="license-gate-title"><h1 id="license-gate-title">{settingUp ? "Tạo passcode quản lý license" : "Nhập passcode quản lý license"}</h1><p>{settingUp ? "Đây là lần thiết lập đầu tiên. Passcode gồm 6 chữ số sẽ được lưu an toàn để mở khu vực quản lý license." : "Nhập passcode 6 chữ số để tiếp tục vào khu vực quản lý license."}</p><form onSubmit={submit} className="license-gate-form"><CodeBoxes label="Passcode 6 chữ số" value={code} onChange={setCode} disabled={false} describedBy="license-gate-help license-gate-error" />{settingUp && <CodeBoxes label="Xác nhận passcode" value={confirmation} onChange={setConfirmation} disabled={false} describedBy="license-gate-help license-gate-error" />}<small id="license-gate-help">Nhập từng số hoặc dán đủ 6 số. Passcode được lưu dạng mã băm và không hiển thị lại.</small>{message && <p id="license-gate-error" className="license-gate-error" role="alert">{message}</p>}<button type="submit" className="button red" disabled={pending || isChecking}>{pending ? "Đang xử lý…" : settingUp ? "Lưu passcode" : "Xác nhận passcode"}</button></form></section>;
}
