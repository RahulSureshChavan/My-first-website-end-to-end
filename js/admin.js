/* ====== CHANGE THIS PASSWORD ====== */
const EDITOR_PASSWORD = "changeme123";
/* =================================== */

let DATA = null;
let currentLang = "en";

function tryUnlock() {
  const pw = document.getElementById("pw").value;
  if (pw === EDITOR_PASSWORD) {
    document.getElementById("lock").style.display = "none";
    document.getElementById("app").style.display = "block";
    document.getElementById("bar").style.display = "flex";
    loadDefault();
  } else {
    document.getElementById("lock-err").textContent = "Wrong password.";
  }
}

function loadDefault() {
  fetch("content.json?_=" + Date.now())
    .then((r) => r.json())
    .then((json) => {
      DATA = json;
      renderAll();
    })
    .catch(() => {
      DATA = { en: emptyLang(), de: emptyLang() };
      renderAll();
    });
}

function emptyLang() {
  return {
    meta: { title: "", tagline: "" },
    nav: { about: "About", skills: "Skills", projects: "Projects", experience: "Experience", contact: "Contact" },
    hero: { photo: "", eyebrow: "", name: "", role: "", subtitle: "", cta_primary: "", cta_secondary: "", stats: [] },
    pipeline: { raw: "", dwh: "", bi: "" },
    about: { heading: "", body: "", resume_label: "", resume_file: "" },
    skills: { heading: "", groups: [] },
    projects: { heading: "", subheading: "", items: [] },
    experience: { heading: "", items: [] },
    education: { heading: "", degrees: [], certifications: [], languages: [] },
    contact: { heading: "", body: "", email: "", phone: "", linkedin: "", github: "", location: "" },
    footer: { text: "" }
  };
}

document.getElementById("fileInput").addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      DATA = JSON.parse(reader.result);
      renderAll();
      alert("Loaded. You are now editing this file.");
    } catch (err) {
      alert("That file isn't valid JSON.");
    }
  };
  reader.readAsText(file);
});

function switchLang(lang) {
  currentLang = lang;
  document.querySelectorAll(".tabs button").forEach((b) =>
    b.classList.toggle("active", b.dataset.tab === lang)
  );
  renderAll();
}

function renderAll() {
  const root = document.getElementById("editor-root");
  root.innerHTML = "";
  const d = DATA[currentLang];

  root.appendChild(section("Hero", [
    field("Photo file path (upload the image to your site's /assets folder, then put the path here, e.g. assets/photo.jpg — leave blank to hide)", d.hero, "photo"),
    field("Eyebrow line (small text above name)", d.hero, "eyebrow"),
    field("Name", d.hero, "name"),
    field("Role / job title", d.hero, "role"),
    field("Subtitle", d.hero, "subtitle", true),
    field("Primary button text", d.hero, "cta_primary"),
    field("Secondary button text", d.hero, "cta_secondary"),
  ]));

  root.appendChild(section("Data pipeline graphic labels", [
    field("Label 1 (Raw Data)", d.pipeline, "raw"),
    field("Label 2 (Data Warehouse)", d.pipeline, "dwh"),
    field("Label 3 (Power BI)", d.pipeline, "bi"),
  ]));

  root.appendChild(repeatableSection(
    "Hero stats (small numbers row)", d.hero.stats,
    (item) => [field2("Value", item, "value"), field2("Label", item, "label")],
    () => ({ value: "", label: "" })
  ));

  root.appendChild(section("About", [
    field("Section heading", d.about, "heading"),
    field("About text", d.about, "body", true),
    field("CV button label", d.about, "resume_label"),
    field("CV file link (optional — leave blank to hide button)", d.about, "resume_file"),
  ]));

  root.appendChild(section("Skills — heading", [
    field("Section heading", d.skills, "heading"),
  ]));
  root.appendChild(repeatableSection(
    "Skill groups", d.skills.groups,
    (item) => [
      field2("Group title", item, "title"),
      field2("Items (comma separated)", item, "items", false, true),
    ],
    () => ({ title: "", items: [] })
  ));

  root.appendChild(section("Projects — heading", [
    field("Section heading", d.projects, "heading"),
    field("Section subheading", d.projects, "subheading"),
  ]));
  root.appendChild(repeatableSection(
    "Projects", d.projects.items,
    (item) => [
      field2("Title", item, "title"),
      field2("Tag (category)", item, "tag"),
      field2("Description", item, "description", true),
      field2("Tech stack (comma separated)", item, "stack", false, true),
      field2("Link (optional)", item, "link"),
    ],
    () => ({ title: "", tag: "", description: "", stack: [], link: "" })
  ));

  root.appendChild(section("Experience — heading", [
    field("Section heading", d.experience, "heading"),
  ]));
  root.appendChild(repeatableSection(
    "Experience entries (top = most recent)", d.experience.items,
    (item) => [
      field2("Role / title", item, "role"),
      field2("Company", item, "company"),
      field2("Period (e.g. 2022 — 2024)", item, "period"),
      field2("Description", item, "description", true),
    ],
    () => ({ role: "", company: "", period: "", description: "" })
  ));

  root.appendChild(section("Education & certifications — heading", [
    field("Section heading", d.education, "heading"),
  ]));
  root.appendChild(repeatableSection(
    "Degrees", d.education.degrees,
    (item) => [
      field2("Degree", item, "degree"),
      field2("School", item, "school"),
      field2("Period", item, "period"),
    ],
    () => ({ degree: "", school: "", period: "" })
  ));
  root.appendChild(section("Certifications (one per line)", [
    (() => {
      const wrap = document.createElement("div");
      const label = document.createElement("label");
      label.textContent = "Certifications — one per line";
      const ta = document.createElement("textarea");
      ta.value = (d.education.certifications || []).join("\n");
      ta.style.minHeight = "100px";
      ta.addEventListener("input", (e) => {
        d.education.certifications = e.target.value.split("\n").map((s) => s.trim()).filter(Boolean);
      });
      wrap.appendChild(label);
      wrap.appendChild(ta);
      return wrap;
    })(),
  ]));
  root.appendChild(repeatableSection(
    "Languages", d.education.languages,
    (item) => [field2("Language", item, "name"), field2("Level", item, "level")],
    () => ({ name: "", level: "" })
  ));

  root.appendChild(section("Contact", [
    field("Section heading", d.contact, "heading"),
    field("Short message", d.contact, "body", true),
    field("Email", d.contact, "email"),
    field("Phone", d.contact, "phone"),
    field("LinkedIn URL", d.contact, "linkedin"),
    field("GitHub URL", d.contact, "github"),
    field("Location", d.contact, "location"),
  ]));

  root.appendChild(section("Navigation menu labels", [
    field("About", d.nav, "about"),
    field("Skills", d.nav, "skills"),
    field("Projects", d.nav, "projects"),
    field("Experience", d.nav, "experience"),
    field("Education", d.nav, "education"),
    field("Contact", d.nav, "contact"),
  ]));

  root.appendChild(section("Footer", [
    field("Footer text", d.footer, "text"),
  ]));
}

/* ---- render helpers ---- */
function section(title, fieldEls) {
  const fs = document.createElement("fieldset");
  fs.appendChild(Object.assign(document.createElement("legend"), { textContent: title }));
  fieldEls.forEach((f) => fs.appendChild(f));
  return fs;
}

function field(labelText, obj, key, isTextarea) {
  const wrap = document.createElement("div");
  const label = document.createElement("label");
  label.textContent = labelText;
  const input = document.createElement(isTextarea ? "textarea" : "input");
  if (!isTextarea) input.type = "text";
  input.value = obj[key] || "";
  input.addEventListener("input", (e) => (obj[key] = e.target.value));
  wrap.appendChild(label);
  wrap.appendChild(input);
  return wrap;
}

function field2(labelText, obj, key, isTextarea, isList) {
  const wrap = document.createElement("div");
  const label = document.createElement("label");
  label.textContent = labelText;
  const input = document.createElement(isTextarea ? "textarea" : "input");
  if (!isTextarea) input.type = "text";
  input.value = isList ? (obj[key] || []).join(", ") : obj[key] || "";
  input.addEventListener("input", (e) => {
    obj[key] = isList
      ? e.target.value.split(",").map((s) => s.trim()).filter(Boolean)
      : e.target.value;
  });
  wrap.appendChild(label);
  wrap.appendChild(input);
  return wrap;
}

function repeatableSection(title, arr, itemFieldsFn, newItemFn) {
  const fs = document.createElement("fieldset");
  fs.appendChild(Object.assign(document.createElement("legend"), { textContent: title }));
  const listWrap = document.createElement("div");

  function draw() {
    listWrap.innerHTML = "";
    arr.forEach((item, idx) => {
      const card = document.createElement("div");
      card.className = "card";
      const rm = document.createElement("button");
      rm.className = "remove";
      rm.textContent = "Remove";
      rm.type = "button";
      rm.addEventListener("click", () => {
        arr.splice(idx, 1);
        draw();
      });
      card.appendChild(rm);
      itemFieldsFn(item).forEach((f) => card.appendChild(f));
      listWrap.appendChild(card);
    });
  }
  draw();

  const addBtn = document.createElement("button");
  addBtn.className = "add-btn";
  addBtn.type = "button";
  addBtn.textContent = "+ Add";
  addBtn.addEventListener("click", () => {
    arr.push(newItemFn());
    draw();
  });

  fs.appendChild(listWrap);
  fs.appendChild(addBtn);
  return fs;
}

function downloadJSON() {
  const blob = new Blob([JSON.stringify(DATA, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "content.json";
  a.click();
  URL.revokeObjectURL(url);
}
