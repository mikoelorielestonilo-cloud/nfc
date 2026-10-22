const $ = (id) => document.getElementById(id);

function getProfileId() {
  return new URLSearchParams(window.location.search).get("id") || "demo";
}
function initialsFor(name = "") {
  return name.trim().split(/\s+/).filter(Boolean).slice(0, 2).map(part => part[0].toUpperCase()).join("") || "VC";
}
function safeText(value) { return typeof value === "string" ? value : ""; }
function normalizePhone(phone) { return safeText(phone).replace(/[^\d+*#;,]/g, ""); }
function safeHttpUrl(value) {
  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol) ? url.href : "";
  } catch { return ""; }
}
function addLink(container, label, href, className = "contact-link") {
  if (!href) return;
  const a = document.createElement("a");
  a.className = className;
  a.textContent = label;
  a.href = href;
  if (href.startsWith("https://") || href.startsWith("http://")) {
    a.target = "_blank";
    a.rel = "noopener noreferrer";
  }
  container.appendChild(a);
}
function setProfile(profile) {
  const name = safeText(profile.name) || "Your Name";
  const phone = safeText(profile.phone);
  const email = safeText(profile.email);
  const company = safeText(profile.company);
  const title = safeText(profile.title);
  const bio = safeText(profile.bio);
  const photoUrl = safeHttpUrl(safeText(profile.photo).trim());

  document.title = `${name} | Digital Business Card`;
  $("name").textContent = name;
  $("title").textContent = title;
  $("title").hidden = !title;
  $("company").textContent = company;
  $("company").hidden = !company;
  $("bio").textContent = bio;
  $("bio").hidden = !bio;
  $("brand").textContent = safeText(profile.brand) || company || "DIGITAL BUSINESS CARD";
  $("companyLabel").textContent = safeText(profile.label) || "DIGITAL BUSINESS CARD";
  $("initials").textContent = initialsFor(name);
  $("photo").hidden = true;
  $("initials").hidden = false;
  if (photoUrl) {
    $("photo").src = photoUrl;
    $("photo").alt = `${name} profile photo`;
    $("photo").onload = () => { $("photo").hidden = false; $("initials").hidden = true; };
    $("photo").onerror = () => { $("photo").hidden = true; $("initials").hidden = false; };
  }

  const contacts = $("contactActions");
  contacts.replaceChildren();
  if (phone) addLink(contacts, "Call", `tel:${normalizePhone(phone)}`);
  if (email) addLink(contacts, "Email", `mailto:${email}`);
  const website = safeHttpUrl(safeText(profile.website));
  if (website) addLink(contacts, "Website", website);
  if (contacts.children.length === 0) {
    const p = document.createElement("p");
    p.className = "bio";
    p.textContent = "Contact details will be added soon.";
    contacts.appendChild(p);
  }

  const social = $("socialLinks");
  social.replaceChildren();
  const socials = profile.socials && typeof profile.socials === "object" ? profile.socials : {};
  const labels = { facebook: "Facebook", instagram: "Instagram", linkedin: "LinkedIn", messenger: "Messenger", whatsapp: "WhatsApp", tiktok: "TikTok", youtube: "YouTube", x: "X" };
  Object.entries(labels).forEach(([key, label]) => {
    const raw = safeText(socials[key]);
    if (!raw) return;
    let url = safeHttpUrl(raw);
    if (key === "whatsapp" && /^\+?[\d\s()-]+$/.test(raw)) url = `https://wa.me/${raw.replace(/\D/g, "")}`;
    if (key === "messenger" && !url) url = `https://m.me/${raw.replace(/^@/, "")}`;
    addLink(social, label, url, "social-link");
  });
  $("socialSection").hidden = social.children.length === 0;

  $("saveContact").onclick = () => downloadVCard(profile);
  $("shareProfile").onclick = async () => {
    const shareData = { title: `${name} — Digital Business Card`, text: `Connect with ${name}`, url: window.location.href };
    try {
      if (navigator.share) await navigator.share(shareData);
      else if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(window.location.href);
        $("notice").textContent = "Profile link copied.";
      } else {
        $("notice").textContent = "Copy this page's URL from your browser address bar to share it.";
      }
    } catch (error) {
      if (error.name !== "AbortError") $("notice").textContent = "Unable to share right now. Copy the page URL instead.";
    }
  };
}
function downloadVCard(profile) {
  const name = safeText(profile.name) || "Contact";
  const phone = safeText(profile.phone);
  const email = safeText(profile.email);
  const company = safeText(profile.company);
  const title = safeText(profile.title);
  const website = safeHttpUrl(safeText(profile.website));
  const escapeV = (v) => safeText(v).replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/,/g, "\\,").replace(/;/g, "\\;");
  const lines = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `FN:${escapeV(name)}`,
    `N:${escapeV(name)};;;;`,
    ...(company ? [`ORG:${escapeV(company)}`] : []),
    ...(title ? [`TITLE:${escapeV(title)}`] : []),
    ...(phone ? [`TEL;TYPE=CELL:${escapeV(phone)}`] : []),
    ...(email ? [`EMAIL;TYPE=INTERNET:${escapeV(email)}`] : []),
    ...(website ? [`URL:${website}`] : []),
    "END:VCARD"
  ];
  const blob = new Blob([lines.join("\r\n") + "\r\n"], { type: "text/vcard;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${name.replace(/[^a-z0-9_-]+/gi, "-") || "contact"}.vcf`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  $("notice").textContent = "Contact file downloaded. Open it to save the contact.";
}
async function loadProfile() {
  try {
    const response = await fetch("customers.json", { cache: "no-store" });
    if (!response.ok) throw new Error("Could not load customers.json");
    const data = await response.json();
    const profiles = Array.isArray(data) ? data : data.customers;
    const profile = profiles && profiles.find(item => item.id === getProfileId());
    if (!profile) {
      $("name").textContent = "Profile not found";
      $("title").textContent = "";
      $("company").textContent = "";
      $("bio").textContent = `No customer profile matches “${getProfileId()}”. Check the id in customers.json.`;
      $("contactActions").replaceChildren();
      $("socialSection").hidden = true;
      $("saveContact").disabled = true;
      $("shareProfile").disabled = true;
      return;
    }
    setProfile(profile);
  } catch (error) {
    $("name").textContent = "Unable to load profile";
    $("bio").textContent = "Check that customers.json exists in the same folder as index.html and contains valid JSON.";
    $("contactActions").replaceChildren();
    $("socialSection").hidden = true;
    console.error(error);
  }
}
loadProfile();
