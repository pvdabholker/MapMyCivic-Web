export const getReports = async () => {
  const token = localStorage.getItem("token");

  const res = await fetch("http://127.0.0.1:8000/report/", {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  return res.json();
};

export const updateStatus = async (id, status) => {
  const token = localStorage.getItem("token");

  const res = await fetch(`http://127.0.0.1:8000/report/${id}?status=${status}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  return res.json();
};

export const uploadCCTV = async (file, lat, lng, address) => {
  const formData = new FormData();

  formData.append("file", file);
  formData.append("latitude", lat);
  formData.append("longitude", lng);
  formData.append("address", address);

  const res = await fetch("http://127.0.0.1:8000/report/cctv", {
    method: "POST",
    body: formData
  });

  return res.json();
};