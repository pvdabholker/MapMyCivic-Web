export const login = async (email, password) => {
  const res = await fetch("http://127.0.0.1:8000/authority/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ email, password })
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.detail);
  }

  // Save token
  localStorage.setItem("token", data.access_token);

  return data;
};