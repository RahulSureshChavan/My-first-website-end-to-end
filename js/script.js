(function () {
  let DATA = null;
  let LANG = localStorage.getItem("site_lang") || "en";

  function el(tag, cls, html) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html !== undefined) e.innerHTML = html;
    return e;
  }

  function render() {
    const d = DATA[LANG];
    document.documentElement.lang = LANG;
    document.title = d.meta.title;

    // simple text nodes via data-i18n path
    document.querySelectorAll("[data-i18n]").forEach((node) => {
      const path = node.getAttribute("data-i18n").split(".");
      let val = d;
      path.forEach((p) => (val = val ? val[p] : ""));
      if (typeof val === "string") node.textContent = val;
    });

    document.getElementById("brand-name").textContent = d.hero.name;
    document.getElementById("hero-name").textContent = d.hero.name;
    document.getElementById("hero-role").textContent = d.hero.role;

    // stats
    const statsWrap = document.getElementById("hero-stats");
    statsWrap.innerHTML = "";
    (d.hero.stats || []).forEach((s) => {
      const item = el("div", "stat");
      item.appendChild(el("div", "stat-value", s.value));
      item.appendChild(el("div", "stat-label", s.label));
      statsWrap.appendChild(item);
    });

    // photo
    const heroGrid = document.getElementById("hero-grid");
    const photoImg = document.getElementById("hero-photo");
    if (d.hero.photo) {
      photoImg.onerror = () => heroGrid.classList.add("no-photo");
      photoImg.onload = () => heroGrid.classList.remove("no-photo");
      photoImg.src = d.hero.photo;
      photoImg.alt = d.hero.name;
    } else {
      heroGrid.classList.add("no-photo");
    }

    // pipeline labels
    if (d.pipeline) {
      document.getElementById("pipe-label-raw").textContent = d.pipeline.raw;
      document.getElementById("pipe-label-dwh").textContent = d.pipeline.dwh;
      document.getElementById("pipe-label-bi").textContent = d.pipeline.bi;
    }

    // about
    document.getElementById("about-body").textContent = d.about.body;
    const cv = document.getElementById("about-cv");
    if (d.about.resume_file) {
      cv.href = d.about.resume_file;
      cv.style.display = "inline-flex";
    } else {
      cv.style.display = "none";
    }

    // skills
    const skillsGrid = document.getElementById("skills-grid");
    skillsGrid.innerHTML = "";
    (d.skills.groups || []).forEach((g) => {
      const card = el("div", "skill-card");
      card.appendChild(el("h3", null, g.title));
      const ul = el("ul");
      g.items.forEach((i) => ul.appendChild(el("li", null, i)));
      card.appendChild(ul);
      skillsGrid.appendChild(card);
    });

    // projects
    const grid = document.getElementById("project-grid");
    grid.innerHTML = "";
    (d.projects.items || []).forEach((p) => {
      const card = el("div", "project-card");
      card.appendChild(el("div", "project-tag", p.tag));
      card.appendChild(el("h3", null, p.title));
      card.appendChild(el("p", null, p.description));
      const stack = el("div", "project-stack");
      (p.stack || []).forEach((s) => stack.appendChild(el("span", null, s)));
      card.appendChild(stack);
      if (p.link) {
        const a = el("a", "project-link", (LANG === "de" ? "Ansehen ↗" : "View ↗"));
        a.href = p.link;
        a.target = "_blank";
        a.rel = "noopener";
        card.appendChild(a);
      }
      grid.appendChild(card);
    });

    // experience
    const timeline = document.getElementById("timeline");
    timeline.innerHTML = "";
    (d.experience.items || []).forEach((x, idx) => {
      const item = el("div", "timeline-item");
      item.appendChild(el("div", "timeline-num", String(idx + 1).padStart(2, "0")));
      const body = el("div");
      body.appendChild(el("div", "timeline-role", `${x.role} · ${x.company}`));
      body.appendChild(el("div", "timeline-meta", x.period));
      body.appendChild(el("div", "timeline-desc", x.description));
      item.appendChild(body);
      timeline.appendChild(item);
    });

    // education
    const degreeList = document.getElementById("degree-list");
    degreeList.innerHTML = "";
    (d.education.degrees || []).forEach((deg) => {
      const item = el("div", "degree-item");
      item.appendChild(el("div", "degree-title", deg.degree));
      item.appendChild(el("div", "degree-school", deg.school));
      item.appendChild(el("div", "degree-period", deg.period));
      degreeList.appendChild(item);
    });

    const certList = document.getElementById("cert-list");
    certList.innerHTML = "";
    certList.appendChild(el("span", "eyebrow", LANG === "de" ? "ZERTIFIZIERUNGEN" : "CERTIFICATIONS"));
    (d.education.certifications || []).forEach((c) => {
      certList.appendChild(el("div", "cert-item", c));
    });

    const langList = document.getElementById("lang-list");
    langList.innerHTML = "";
    langList.appendChild(el("span", "eyebrow", LANG === "de" ? "SPRACHEN" : "LANGUAGES"));
    (d.education.languages || []).forEach((l) => {
      const row = el("div", "lang-item");
      const strong = el("strong", null, l.name);
      row.appendChild(strong);
      row.appendChild(document.createTextNode(" — " + l.level));
      langList.appendChild(row);
    });

    // contact
    document.getElementById("contact-heading").textContent = d.contact.heading;
    document.getElementById("contact-body").textContent = d.contact.body;
    const links = document.getElementById("contact-links");
    links.innerHTML = "";
    const email = el("a", null, `✉ ${d.contact.email}`);
    email.href = `mailto:${d.contact.email}`;
    links.appendChild(email);

    if (d.contact.phone) {
      const phone = el("a", null, `☎ ${d.contact.phone}`);
      phone.href = `tel:${d.contact.phone.replace(/\s+/g, "")}`;
      links.appendChild(phone);
    }

    const li = el("a", null, "↗ LinkedIn");
    li.href = d.contact.linkedin;
    li.target = "_blank"; li.rel = "noopener";
    links.appendChild(li);

    if (d.contact.github) {
      const gh = el("a", null, "↗ GitHub");
      gh.href = d.contact.github;
      gh.target = "_blank"; gh.rel = "noopener";
      links.appendChild(gh);
    }

    const loc = el("div", null, `📍 ${d.contact.location}`);
    loc.style.fontFamily = "var(--mono)";
    loc.style.fontSize = "13px";
    loc.style.color = "#B9C0D4";
    loc.style.marginTop = "4px";
    links.appendChild(loc);

    document.getElementById("footer-text").textContent =
      `${d.footer.text} © ${new Date().getFullYear()}`;

    document.querySelectorAll(".lang-toggle button").forEach((b) => {
      b.classList.toggle("active", b.dataset.lang === LANG);
    });
  }

  function setupLangToggle() {
    document.querySelectorAll(".lang-toggle button").forEach((btn) => {
      btn.addEventListener("click", () => {
        LANG = btn.dataset.lang;
        localStorage.setItem("site_lang", LANG);
        render();
      });
    });
  }

  function setupMobileNav() {
    const toggle = document.getElementById("nav-toggle");
    const nav = document.getElementById("main-nav");
    toggle.addEventListener("click", () => nav.classList.toggle("open"));
    nav.querySelectorAll("a").forEach((a) =>
      a.addEventListener("click", () => nav.classList.remove("open"))
    );
  }

  function setupReveal() {
    const items = document.querySelectorAll(".reveal");
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            obs.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    items.forEach((i) => obs.observe(i));
  }

  fetch("content.json?_=" + Date.now())
    .then((r) => r.json())
    .then((json) => {
      DATA = json;
      render();
      setupLangToggle();
      setupMobileNav();
      setupReveal();
    })
    .catch((err) => {
      document.body.innerHTML =
        '<p style="padding:40px;font-family:sans-serif">Could not load content.json. Make sure it is in the same folder as index.html.</p>';
      console.error(err);
    });
})();
