export default function GeneratePasswordUtility(): string {
  const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lower = "abcdefghijklmnopqrstuvwxyz";
  const digits = "0123456789";
  const symbols = "!@#$%^&*()-_=+[]{}|;:,.<>?";
  const allChars = upper + lower + digits + symbols;

  const getRandomChar = (set: string): string => set[Math.floor(Math.random() * set.length)];

  const getRandomLength = (): number => Math.floor(Math.random() * 5) + 8; // 8~12

  const targetLength = getRandomLength();
  let password = "";

  password += getRandomChar(upper);
  password += getRandomChar(lower);
  password += getRandomChar(digits);
  password += getRandomChar(symbols);

  while (password.length < targetLength) {
    const nextChar = getRandomChar(allChars);

    const len = password.length;
    if (len >= 2 && password[len - 1] === nextChar && password[len - 2] === nextChar) {
      continue;
    }

    password += nextChar;
  }

  return shuffleString(password);
}

function shuffleString(str: string): string {
  const arr = str.split("");
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.join("");
}
