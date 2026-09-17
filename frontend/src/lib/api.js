const apiBase = import.meta.env.VITE_API_BASE_URL || "/api";

export async function getPublicCohorts() {
  const response = await fetch(`${apiBase}/cohorts/`);
  const data = await response.json();
  if (!response.ok)
    throw new Error(data.error || "Unable to load open cohorts.");
  return data.cohorts;
}

let cachedCsrfToken = "";

async function refreshCsrf() {
  try {
    const res = await fetch(`${apiBase}/csrf/`, { credentials: "include" });
    if (res.ok) {
      const data = await res.json();
      if (data?.csrfToken) {
        cachedCsrfToken = data.csrfToken;
      }
    }
  } catch {
    // ignore network error, fall back to cookie
  }
}

function csrfToken() {
  if (cachedCsrfToken) return cachedCsrfToken;
  return (
    document.cookie
      .split(";")
      .map((cookie) => cookie.trim())
      .find((cookie) => cookie.startsWith("csrftoken="))
      ?.split("=")[1] || ""
  );
}

export async function initializePayment(payload) {
  await refreshCsrf();
  const response = await fetch(`${apiBase}/enroll/initialize/`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-CSRFToken": csrfToken() },
    credentials: "include",
    body: JSON.stringify(payload),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Unable to start checkout.");
  return data;
}

export async function verifyPayment(reference) {
  const response = await fetch(
    `${apiBase}/payments/verify/?reference=${encodeURIComponent(reference)}`,
    { credentials: "include" },
  );
  const data = await response.json();
  if (!response.ok)
    throw new Error(data.error || "Payment verification failed.");
  return data;
}

export async function adminLogin(credentials) {
  await refreshCsrf();
  const response = await fetch(`${apiBase}/admin/login/`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-CSRFToken": csrfToken() },
    credentials: "include",
    body: JSON.stringify(credentials),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Login failed.");
  return data;
}

export async function adminMe() {
  try {
    const response = await fetch(`${apiBase}/admin/me/`, {
      credentials: "include",
    });
    if (!response.ok) return { authenticated: false };
    return await response.json();
  } catch {
    return { authenticated: false };
  }
}

export async function adminLogout() {
  await refreshCsrf();
  const response = await fetch(`${apiBase}/admin/logout/`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-CSRFToken": csrfToken() },
    credentials: "include",
  });
  return response.json();
}

export async function getAdminCohorts() {
  const response = await fetch(`${apiBase}/admin/cohorts/`, {
    credentials: "include",
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Unable to fetch cohorts.");
  return data.cohorts;
}

export async function saveAdminCohort(cohortData) {
  await refreshCsrf();
  const response = await fetch(`${apiBase}/admin/cohorts/`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-CSRFToken": csrfToken() },
    credentials: "include",
    body: JSON.stringify(cohortData),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Unable to save cohort.");
  return data.cohort;
}

export async function getAdminOverview() {
  const response = await fetch(`${apiBase}/admin/overview/`, {
    credentials: "include",
  });
  const data = await response.json();
  if (!response.ok)
    throw new Error(data.error || "Unable to load overview stats.");
  return data;
}

export async function getAdminStudents(params = {}) {
  const query = new URLSearchParams(params).toString();
  const url = query
    ? `${apiBase}/admin/students/?${query}`
    : `${apiBase}/admin/students/`;
  const response = await fetch(url, { credentials: "include" });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Unable to fetch students.");
  return data;
}

export async function deleteAdminCohort(cohortId) {
  await refreshCsrf();
  const response = await fetch(`${apiBase}/admin/cohorts/${cohortId}/delete/`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-CSRFToken": csrfToken() },
    credentials: "include",
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Failed to delete cohort.");
  return data;
}

export async function deleteAdminStudent(studentId) {
  await refreshCsrf();
  const response = await fetch(
    `${apiBase}/admin/students/${studentId}/delete/`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": csrfToken(),
      },
      credentials: "include",
    },
  );
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Failed to delete student.");
  return data;
}
