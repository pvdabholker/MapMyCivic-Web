export const getCurrentUser = async () => {
  const token = localStorage.getItem("token");

  const res = await fetch("http://127.0.0.1:8000/authority/me", {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  return res.json();
};