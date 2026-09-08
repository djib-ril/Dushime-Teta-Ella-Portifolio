// DUSHIME Teta Ella - Portfolio CMS Controller

document.addEventListener('DOMContentLoaded', () => {
  // 1. Auth Guard
  const isAuthenticated = sessionStorage.getItem('ella_admin_authenticated') === 'true';
  if (!isAuthenticated) {
    alert('Admin session not detected. Please log in first.');
    window.location.href = 'index.html';
    return;
  }

  let currentData = null;

  // 2. Initialize
  initAdminDashboard();
  initLogout();

  async function initAdminDashboard() {
    // NEW UPDATED CODE for admin.js
async function initAdminDashboard() {
  // 1. Try loading live content directly from Supabase Cloud
  const supabase = typeof window.getSupabaseClient === 'function' ? window.getSupabaseClient() : null;
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('portfolio_content')
        .select('content')
        .eq('id', 'main_portfolio')
        .single();

      if (data && data.content && !error) {
        currentData = data.content;
        console.log('Loaded admin content directly from Supabase!');
      }
    } catch (supErr) {
      console.warn('Supabase fetch exception in admin:', supErr);
    }
  }

  // 2. Fall back to local server /api/content if Supabase didn't return data
  if (!currentData) {
    try {
      const res = await fetch('/api/content', { cache: 'no-store' });
      if (res.ok) {
        currentData = await res.json();
      }
    } catch (err) {
      console.warn('Falling back to local cache:', err);
      const cached = localStorage.getItem('teta_ella_portfolio_data');
      if (cached) {
        currentData = JSON.parse(cached);
      }
    }
  }

  // 3. Fall back to default empty structure if nothing was retrieved
  if (!currentData) {
    console.warn('No existing data found. Initializing empty admin fields.');
    currentData = {};
  }

  // Populate all fields
  populateHero(currentData.hero || {});
  populateAbout(currentData.about || {});
  populateSkills(currentData.skills || {});
  populateProjects(currentData.projects || []);
  populatePrograms(currentData.programs || []);
  populateClubs(currentData.clubs || []);
  populateVision(currentData.vision || {});
  populateContact(currentData.contact || {});

  // Bind event listeners
  initHeroImageUpload();
  initDynamicAddButtons();
  initSaveActions();
  initResetDefaults();
  initSupabaseUI();
}

    // Populate all fields
    populateHero(currentData.hero || {});
    populateAbout(currentData.about || {});
    populateSkills(currentData.skills || {});
    populateProjects(currentData.projects || []);
    populatePrograms(currentData.programs || []);
    populateClubs(currentData.clubs || []);
    populateVision(currentData.vision || {});
    populateContact(currentData.contact || {});

    // Bind event listeners
    initHeroImageUpload();
    initDynamicAddButtons();
    initSaveActions();
    initResetDefaults();
    initSupabaseUI();
  }

  // Populators
  function populateHero(hero) {
    document.getElementById('inputHeroGreeting').value = hero.greeting || "Hello, I'm";
    document.getElementById('inputHeroName').value = hero.name || 'DUSHIME Teta Ella';
    document.getElementById('inputHeroTitle').value = hero.title || '';
    document.getElementById('inputHeroBio').value = hero.bio || '';
    document.getElementById('inputHeroImagePath').value = hero.profileImage || 'images/teta_ella_portrait.jpg';
    
    const preview = document.getElementById('heroImagePreview');
    preview.src = hero.profileImage || 'images/teta_ella_portrait.jpg';
    const sidebarAvatar = document.getElementById('sidebarAvatar');
    if (sidebarAvatar) sidebarAvatar.src = preview.src;

    renderHeroRoles(hero.roles || []);
  }

  function renderHeroRoles(roles) {
    const container = document.getElementById('heroRolesEditorList');
    container.innerHTML = roles.map((r, idx) => `
      <div class="skill-editor-row" data-role-idx="${idx}">
        <input type="text" class="form-input role-title-input" value="${escapeHtml(r.title)}" placeholder="Role Title">
        <input type="text" class="form-input role-desc-input" value="${escapeHtml(r.desc)}" placeholder="Role Description">
        <input type="text" class="form-input role-icon-input" value="${escapeHtml(r.icon || 'star')}" placeholder="Icon">
        <button type="button" class="btn-icon-danger remove-role-btn" title="Remove"><i class="fa-solid fa-trash"></i></button>
      </div>
    `).join('');

    container.querySelectorAll('.remove-role-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.target.closest('.skill-editor-row').remove();
        markUnsaved();
      });
    });
  }

  function populateAbout(about) {
    const list = document.getElementById('aboutParagraphsList');
    const paragraphs = about.paragraphs || [];
    list.innerHTML = paragraphs.map(p => createParagraphItemHtml(p)).join('');
    bindParagraphRemoveBtns();

    const statsList = document.getElementById('aboutStatsList');
    const stats = about.stats || [];
    statsList.innerHTML = stats.map((st, idx) => `
      <div class="stat-editor-card" data-stat-idx="${idx}">
        <label>Stat #${idx + 1}</label>
        <input type="text" class="form-input stat-number-input" value="${escapeHtml(st.number)}" placeholder="e.g. 3+">
        <input type="text" class="form-input stat-label-input" value="${escapeHtml(st.label)}" placeholder="e.g. Projects Completed">
      </div>
    `).join('');
  }

  function createParagraphItemHtml(text) {
    return `
      <div class="paragraph-editor-item">
        <textarea class="form-textarea about-p-input" rows="3" placeholder="Enter paragraph...">${escapeHtml(text || '')}</textarea>
        <button type="button" class="btn-icon-danger remove-p-btn" title="Remove Paragraph"><i class="fa-solid fa-trash"></i></button>
      </div>
    `;
  }

  function bindParagraphRemoveBtns() {
    document.querySelectorAll('.remove-p-btn').forEach(btn => {
      btn.onclick = (e) => {
        e.target.closest('.paragraph-editor-item').remove();
        markUnsaved();
      };
    });
  }

  function populateSkills(skills) {
    renderSkillsList('businessSkillsList', skills.business || []);
    renderSkillsList('techSkillsList', skills.tech || []);
    renderSkillsList('softSkillsList', skills.soft || []);
  }

  function renderSkillsList(containerId, list) {
    const container = document.getElementById(containerId);
    container.innerHTML = list.map(item => createSkillRowHtml(item.name, item.level)).join('');
    bindSkillRowEvents(container);
  }

  function createSkillRowHtml(name, level) {
    return `
      <div class="skill-editor-row">
        <input type="text" class="form-input skill-name-input" value="${escapeHtml(name || '')}" placeholder="Skill Name">
        <div class="range-wrap">
          <input type="range" class="skill-level-slider" min="10" max="100" value="${level || 80}" style="width: 100%;">
        </div>
        <span class="level-value-display">${level || 80}%</span>
        <button type="button" class="btn-icon-danger remove-skill-btn" title="Remove"><i class="fa-solid fa-trash"></i></button>
      </div>
    `;
  }

  function bindSkillRowEvents(container) {
    container.querySelectorAll('.skill-editor-row').forEach(row => {
      const slider = row.querySelector('.skill-level-slider');
      const display = row.querySelector('.level-value-display');
      slider.oninput = () => {
        display.textContent = `${slider.value}%`;
        markUnsaved();
      };
      const removeBtn = row.querySelector('.remove-skill-btn');
      removeBtn.onclick = () => {
        row.remove();
        markUnsaved();
      };
    });
  }

  function populateProjects(projects) {
    const container = document.getElementById('projectsEditorList');
    container.innerHTML = projects.map(proj => createProjectCardHtml(proj)).join('');
    bindProjectCardEvents(container);
  }

  function createProjectCardHtml(proj) {
    const p = proj || { title: '', category: '', description: '', tags: [], image: 'images/sample.webp' };
    return `
      <div class="item-editor-card project-card-item">
        <div class="item-card-topbar">
          <span class="item-badge-title"><i class="fa-solid fa-briefcase"></i> Project Details</span>
          <button type="button" class="btn-icon-danger remove-project-btn" title="Delete Project"><i class="fa-solid fa-trash"></i></button>
        </div>
        <div class="form-row-2">
          <div class="form-group">
            <label>Project Title</label>
            <input type="text" class="form-input project-title-input" value="${escapeHtml(p.title)}" placeholder="e.g. Save the Date Design Business">
          </div>
          <div class="form-group">
            <label>Category</label>
            <input type="text" class="form-input project-cat-input" value="${escapeHtml(p.category)}" placeholder="e.g. Digital Commerce & Design">
          </div>
        </div>
        <div class="form-group">
          <label>Description</label>
          <textarea class="form-textarea project-desc-input" rows="3">${escapeHtml(p.description)}</textarea>
        </div>
        <div class="form-row-2">
          <div class="form-group">
            <label>Tags (comma separated)</label>
            <input type="text" class="form-input project-tags-input" value="${escapeHtml((p.tags || []).join(', '))}" placeholder="Canva, Branding, Digital Commerce">
          </div>
          <div class="form-group">
            <label>Project Cover Image</label>
            <div style="display: flex; gap: 0.5rem; align-items: center;">
              <input type="text" class="form-input project-img-input" value="${escapeHtml(p.image || '')}" placeholder="images/sample.webp">
              <label class="btn btn-secondary btn-sm" style="margin: 0; cursor: pointer;">
                <i class="fa-solid fa-upload"></i> Upload
                <input type="file" accept="image/*" class="project-img-file" style="display: none;">
              </label>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function bindProjectCardEvents(container) {
    container.querySelectorAll('.project-card-item').forEach(card => {
      const removeBtn = card.querySelector('.remove-project-btn');
      if (removeBtn) {
        removeBtn.onclick = () => { card.remove(); markUnsaved(); };
      }

      const fileInput = card.querySelector('.project-img-file');
      const pathInput = card.querySelector('.project-img-input');
      if (fileInput) {
        fileInput.onchange = async () => {
          if (fileInput.files && fileInput.files[0]) {
            const file = fileInput.files[0];
            try {
              showToast('Uploading project image...');
              const res = await uploadPhoto(file);
              if (res && res.url) {
                pathInput.value = res.url;
                const dest = res.source === 'supabase' ? 'Supabase Storage' : 'Server';
                showToast(`Project image uploaded to ${dest}!`);
                markUnsaved();
              }
            } catch (err) {
              console.error(err);
              alert('Upload failed: ' + err.message);
            }
          }
        };
      }
    });
  }

  function populatePrograms(programs) {
    const container = document.getElementById('programsEditorList');
    container.innerHTML = programs.map(prog => createProgramCardHtml(prog)).join('');
    bindProgramCardEvents(container);
  }

  function createProgramCardHtml(prog) {
    const p = prog || { title: '', organization: '', period: '', badge: '', description: '' };
    return `
      <div class="item-editor-card program-card-item">
        <div class="item-card-topbar">
          <span class="item-badge-title"><i class="fa-solid fa-certificate"></i> Program / Training</span>
          <button type="button" class="btn-icon-danger remove-program-btn" title="Delete"><i class="fa-solid fa-trash"></i></button>
        </div>
        <div class="form-row-2">
          <div class="form-group">
            <label>Program Name</label>
            <input type="text" class="form-input prog-title-input" value="${escapeHtml(p.title)}" placeholder="e.g. HerInTech Summer Camp">
          </div>
          <div class="form-group">
            <label>Badge / Focus</label>
            <input type="text" class="form-input prog-badge-input" value="${escapeHtml(p.badge)}" placeholder="e.g. Web Tech & Design">
          </div>
        </div>
        <div class="form-row-2">
          <div class="form-group">
            <label>Organization</label>
            <input type="text" class="form-input prog-org-input" value="${escapeHtml(p.organization)}" placeholder="e.g. HerInTech Initiative">
          </div>
          <div class="form-group">
            <label>Period / Year</label>
            <input type="text" class="form-input prog-period-input" value="${escapeHtml(p.period)}" placeholder="e.g. Summer 2024">
          </div>
        </div>
        <div class="form-group">
          <label>Description</label>
          <textarea class="form-textarea prog-desc-input" rows="2">${escapeHtml(p.description)}</textarea>
        </div>
      </div>
    `;
  }

  function bindProgramCardEvents(container) {
    container.querySelectorAll('.remove-program-btn').forEach(btn => {
      btn.onclick = (e) => { e.target.closest('.program-card-item').remove(); markUnsaved(); };
    });
  }

  function populateClubs(clubs) {
    const container = document.getElementById('clubsEditorList');
    container.innerHTML = clubs.map(club => createClubCardHtml(club)).join('');
    bindClubCardEvents(container);
  }

  function createClubCardHtml(club) {
    const c = club || { name: '', role: '', period: '', description: '' };
    return `
      <div class="item-editor-card club-card-item">
        <div class="item-card-topbar">
          <span class="item-badge-title"><i class="fa-solid fa-users"></i> Club / Leadership Role</span>
          <button type="button" class="btn-icon-danger remove-club-btn" title="Delete"><i class="fa-solid fa-trash"></i></button>
        </div>
        <div class="form-row-2">
          <div class="form-group">
            <label>Club Name</label>
            <input type="text" class="form-input club-name-input" value="${escapeHtml(c.name)}" placeholder="e.g. Girl Up Club">
          </div>
          <div class="form-group">
            <label>Role</label>
            <input type="text" class="form-input club-role-input" value="${escapeHtml(c.role)}" placeholder="e.g. Active Member & Advocate">
          </div>
        </div>
        <div class="form-group">
          <label>Period</label>
          <input type="text" class="form-input club-period-input" value="${escapeHtml(c.period)}" placeholder="e.g. 2023 - Present">
        </div>
        <div class="form-group">
          <label>Description</label>
          <textarea class="form-textarea club-desc-input" rows="2">${escapeHtml(c.description)}</textarea>
        </div>
      </div>
    `;
  }

  function bindClubCardEvents(container) {
    container.querySelectorAll('.remove-club-btn').forEach(btn => {
      btn.onclick = (e) => { e.target.closest('.club-card-item').remove(); markUnsaved(); };
    });
  }

  function populateVision(vision) {
    document.getElementById('inputVisionQuote').value = vision.quote || '';
    document.getElementById('inputVisionSecondary').value = vision.secondary || '';
  }

  function populateContact(contact) {
    document.getElementById('inputContactEmail').value = contact.email || '';
    document.getElementById('inputContactPhone').value = contact.phone || '';
    document.getElementById('inputContactLocation').value = contact.location || '';
    document.getElementById('inputContactSchool').value = contact.school || '';
    document.getElementById('inputContactLinkedin').value = contact.linkedin || '';
    document.getElementById('inputContactGithub').value = contact.github || '';
  }

  // Hero Image Upload Logic
  function initHeroImageUpload() {
    const dropzone = document.getElementById('heroDropzone');
    const fileInput = document.getElementById('heroImageFile');
    const preview = document.getElementById('heroImagePreview');
    const pathInput = document.getElementById('inputHeroImagePath');
    const sidebarAvatar = document.getElementById('sidebarAvatar');

    dropzone.onclick = () => fileInput.click();

    fileInput.onchange = async () => {
      if (fileInput.files && fileInput.files[0]) {
        const file = fileInput.files[0];
        try {
          const base64 = await fileToBase64(file);
          preview.src = base64;
          if (sidebarAvatar) sidebarAvatar.src = base64;
          
          showToast('Uploading photo...');
          const uploadRes = await uploadPhoto(file);
          if (uploadRes && uploadRes.url) {
            pathInput.value = uploadRes.url;
            preview.src = uploadRes.url;
            const dest = uploadRes.source === 'supabase' ? 'Supabase Cloud Storage' : 'Server uploads';
            showToast(`Hero portrait uploaded to ${dest}!`);
            markUnsaved();
          }
        } catch (err) {
          console.error(err);
          alert('Failed to upload image: ' + err.message);
        }
      }
    };
  }

  // Dynamic Add Buttons
  function initDynamicAddButtons() {
    // Add Paragraph
    document.getElementById('addAboutParagraphBtn').onclick = () => {
      const list = document.getElementById('aboutParagraphsList');
      const div = document.createElement('div');
      div.innerHTML = createParagraphItemHtml('');
      const child = div.firstElementChild;
      list.appendChild(child);
      bindParagraphRemoveBtns();
      markUnsaved();
    };

    // Add Skills
    document.getElementById('addBusinessSkillBtn').onclick = () => {
      addSkillRow('businessSkillsList', 'New Business Skill', 85);
    };
    document.getElementById('addTechSkillBtn').onclick = () => {
      addSkillRow('techSkillsList', 'New Tech Skill', 80);
    };
    document.getElementById('addSoftSkillBtn').onclick = () => {
      addSkillRow('softSkillsList', 'New Leadership Skill', 90);
    };

    // Add Project
    document.getElementById('addNewProjectBtn').onclick = () => {
      const container = document.getElementById('projectsEditorList');
      const div = document.createElement('div');
      div.innerHTML = createProjectCardHtml();
      const child = div.firstElementChild;
      container.insertBefore(child, container.firstChild);
      bindProjectCardEvents(container);
      markUnsaved();
    };

    // Add Program
    document.getElementById('addNewProgramBtn').onclick = () => {
      const container = document.getElementById('programsEditorList');
      const div = document.createElement('div');
      div.innerHTML = createProgramCardHtml();
      const child = div.firstElementChild;
      container.insertBefore(child, container.firstChild);
      bindProgramCardEvents(container);
      markUnsaved();
    };

    // Add Club
    document.getElementById('addNewClubBtn').onclick = () => {
      const container = document.getElementById('clubsEditorList');
      const div = document.createElement('div');
      div.innerHTML = createClubCardHtml();
      const child = div.firstElementChild;
      container.insertBefore(child, container.firstChild);
      bindClubCardEvents(container);
      markUnsaved();
    };

    // Listen to changes across all inputs to flag unsaved
    document.getElementById('portfolioAdminForm').addEventListener('input', () => {
      markUnsaved();
    });
  }

  function addSkillRow(containerId, name, level) {
    const container = document.getElementById(containerId);
    const div = document.createElement('div');
    div.innerHTML = createSkillRowHtml(name, level);
    const child = div.firstElementChild;
    container.appendChild(child);
    bindSkillRowEvents(container);
    markUnsaved();
  }

  // Save All Changes Action
  function initSaveActions() {
    const saveBtn = document.getElementById('saveAllBtn');
    const stickySaveBtn = document.getElementById('stickySaveAllBtn');

    const handleSave = async () => {
      saveBtn.disabled = true;
      stickySaveBtn.disabled = true;
      saveBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Saving...';
      stickySaveBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Saving...';

      const updatedData = collectAllFormData();

      try {
        let supabaseSaved = false;
        const supabase = typeof window.getSupabaseClient === 'function' ? window.getSupabaseClient() : null;
        if (supabase) {
          try {
            const { error: supError } = await supabase
              .from('portfolio_content')
              .upsert({
                id: 'main_portfolio',
                content: updatedData,
                updated_at: new Date().toISOString()
              });
            if (!supError) {
              supabaseSaved = true;
              console.log('Saved to Supabase portfolio_content table successfully!');
            } else {
              console.warn('Supabase save returned error:', supError.message);
            }
          } catch (supErr) {
            console.warn('Supabase upsert exception:', supErr);
          }
        }

        // Also persist to local server and localStorage
        const res = await fetch('/api/content', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedData)
        });

        if (res.ok || supabaseSaved) {
          localStorage.setItem('teta_ella_portfolio_data', JSON.stringify(updatedData));
          currentData = updatedData;
          markSynced();
          if (supabaseSaved) {
            showToast('Changes saved to Supabase Cloud! Live immediately for everyone.');
          } else {
            showToast('Changes saved live! Everyone with the link can now see them.');
          }
        } else {
          throw new Error('Server returned ' + res.status);
        }
      } catch (err) {
        console.warn('Saving to server failed, saving locally:', err);
        localStorage.setItem('teta_ella_portfolio_data', JSON.stringify(updatedData));
        markSynced();
        showToast('Saved locally in browser cache.');
      } finally {
        saveBtn.disabled = false;
        stickySaveBtn.disabled = false;
        saveBtn.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Save All Changes';
        stickySaveBtn.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Save All Changes';
      }
    };

    saveBtn.onclick = handleSave;
    stickySaveBtn.onclick = handleSave;
  }

  // Collect All Form Data into Structured JSON
  function collectAllFormData() {
    // Hero Roles
    const roles = [];
    document.querySelectorAll('#heroRolesEditorList .skill-editor-row').forEach(row => {
      roles.push({
        title: row.querySelector('.role-title-input').value.trim(),
        desc: row.querySelector('.role-desc-input').value.trim(),
        icon: row.querySelector('.role-icon-input').value.trim() || 'star'
      });
    });

    // About Paragraphs
    const paragraphs = [];
    document.querySelectorAll('.about-p-input').forEach(ta => {
      const val = ta.value.trim();
      if (val) paragraphs.push(val);
    });

    // About Stats
    const stats = [];
    document.querySelectorAll('#aboutStatsList .stat-editor-card').forEach(c => {
      stats.push({
        number: c.querySelector('.stat-number-input').value.trim(),
        label: c.querySelector('.stat-label-input').value.trim()
      });
    });

    // Skills
    const getSkills = (containerId) => {
      const arr = [];
      document.querySelectorAll(`#${containerId} .skill-editor-row`).forEach(row => {
        const name = row.querySelector('.skill-name-input').value.trim();
        const level = parseInt(row.querySelector('.skill-level-slider').value, 10) || 80;
        if (name) arr.push({ name, level });
      });
      return arr;
    };

    // Projects
    const projects = [];
    document.querySelectorAll('.project-card-item').forEach((card, idx) => {
      const title = card.querySelector('.project-title-input').value.trim();
      const category = card.querySelector('.project-cat-input').value.trim();
      const description = card.querySelector('.project-desc-input').value.trim();
      const tagsRaw = card.querySelector('.project-tags-input').value.trim();
      const image = card.querySelector('.project-img-input').value.trim() || 'images/sample.webp';
      const tags = tagsRaw ? tagsRaw.split(',').map(t => t.trim()).filter(Boolean) : [];
      if (title) {
        projects.push({ id: `proj-${idx + 1}`, title, category, description, tags, image, link: '#' });
      }
    });

    // Programs
    const programs = [];
    document.querySelectorAll('.program-card-item').forEach((card, idx) => {
      const title = card.querySelector('.prog-title-input').value.trim();
      const badge = card.querySelector('.prog-badge-input').value.trim();
      const organization = card.querySelector('.prog-org-input').value.trim();
      const period = card.querySelector('.prog-period-input').value.trim();
      const description = card.querySelector('.prog-desc-input').value.trim();
      if (title) {
        programs.push({ id: `prog-${idx + 1}`, title, badge, organization, period, description });
      }
    });

    // Clubs
    const clubs = [];
    document.querySelectorAll('.club-card-item').forEach((card, idx) => {
      const name = card.querySelector('.club-name-input').value.trim();
      const role = card.querySelector('.club-role-input').value.trim();
      const period = card.querySelector('.club-period-input').value.trim();
      const description = card.querySelector('.club-desc-input').value.trim();
      if (name) {
        clubs.push({ id: `club-${idx + 1}`, name, role, period, description });
      }
    });

    return {
      hero: {
        greeting: document.getElementById('inputHeroGreeting').value.trim(),
        name: document.getElementById('inputHeroName').value.trim(),
        title: document.getElementById('inputHeroTitle').value.trim(),
        bio: document.getElementById('inputHeroBio').value.trim(),
        profileImage: document.getElementById('inputHeroImagePath').value.trim(),
        cvUrl: currentData?.hero?.cvUrl || '#',
        roles: roles.length ? roles : currentData?.hero?.roles || []
      },
      about: {
        headline: currentData?.about?.headline || '',
        paragraphs,
        stats
      },
      skills: {
        business: getSkills('businessSkillsList'),
        tech: getSkills('techSkillsList'),
        soft: getSkills('softSkillsList')
      },
      projects,
      programs,
      clubs,
      vision: {
        quote: document.getElementById('inputVisionQuote').value.trim(),
        secondary: document.getElementById('inputVisionSecondary').value.trim()
      },
      contact: {
        fullName: document.getElementById('inputHeroName').value.trim(),
        location: document.getElementById('inputContactLocation').value.trim(),
        school: document.getElementById('inputContactSchool').value.trim(),
        combination: currentData?.contact?.combination || '',
        email: document.getElementById('inputContactEmail').value.trim(),
        phone: document.getElementById('inputContactPhone').value.trim(),
        linkedin: document.getElementById('inputContactLinkedin').value.trim(),
        github: document.getElementById('inputContactGithub').value.trim()
      }
    };
  }

  // Upload Image Helper
  async function uploadImageToServer(filename, base64) {
    const res = await fetch('/api/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filename, base64 })
    });
    return await res.json();
  }

  function fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  // UI Status Helpers
  function markUnsaved() {
    const indicator = document.getElementById('saveStatusIndicator');
    if (indicator) {
      indicator.className = 'status-indicator unsaved';
      indicator.innerHTML = '<i class="fa-solid fa-circle-dot"></i><span>Unsaved edits</span>';
    }
  }

  function markSynced() {
    const indicator = document.getElementById('saveStatusIndicator');
    if (indicator) {
      indicator.className = 'status-indicator synced';
      indicator.innerHTML = '<i class="fa-solid fa-circle-check"></i><span>Synced with data.json</span>';
    }
  }

  function showToast(msg) {
    const toast = document.getElementById('adminToast');
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3500);
  }

  // Logout
  function initLogout() {
    document.getElementById('adminLogoutBtn').onclick = () => {
      sessionStorage.removeItem('ella_admin_authenticated');
      sessionStorage.removeItem('teta_ella_auth_token');
      window.location.href = 'index.html';
    };
  }

  // Reset to Defaults
  function initResetDefaults() {
    document.getElementById('resetDefaultsBtn').onclick = async () => {
      if (confirm('Are you sure you want to reload default content from the server? Any unsaved edits will be discarded.')) {
        localStorage.removeItem('teta_ella_portfolio_data');
        window.location.reload();
      }
    };
  }

  // Escape HTML Helper
  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
});

  // Unified Photo Upload Helper (Supabase Storage with Local Fallback)
  async function uploadPhoto(file) {
    const supabase = typeof window.getSupabaseClient === 'function' ? window.getSupabaseClient() : null;
    if (supabase) {
      try {
        const cleanName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
        const uniqueName = Date.now() + '_' + cleanName;
        
        const { data, error } = await supabase.storage
          .from('portfolio-pictures')
          .upload(uniqueName, file, { cacheControl: '3600', upsert: true });

        if (!error && data) {
          const { data: urlData } = supabase.storage
            .from('portfolio-pictures')
            .getPublicUrl(uniqueName);

          if (urlData && urlData.publicUrl) {
            return { success: true, url: urlData.publicUrl, source: 'supabase' };
          }
        }
        if (error) {
          console.warn('Supabase Storage upload warning:', error.message);
        }
      } catch (err) {
        console.warn('Supabase upload exception:', err);
      }
    }

    // Local Server Fallback
    const base64 = await fileToBase64(file);
    const localRes = await uploadImageToServer(file.name, base64);
    return { success: localRes.success, url: localRes.url, source: 'local' };
  }

  // Supabase Connection UI & Status
  function initSupabaseUI() {
    const urlInput = document.getElementById('inputSupabaseUrl');
    const keyInput = document.getElementById('inputSupabaseKey');
    const saveBtn = document.getElementById('saveSupabaseSettingsBtn');
    const indicator = document.getElementById('supabaseStatusIndicator');

    const curUrl = localStorage.getItem('supabase_project_url') || (window.SUPABASE_CONFIG ? window.SUPABASE_CONFIG.url : '');
    const curKey = localStorage.getItem('supabase_anon_key') || (window.SUPABASE_CONFIG ? window.SUPABASE_CONFIG.anonKey : '');

    if (urlInput && curUrl && curUrl !== 'YOUR_PROJECT_URL') urlInput.value = curUrl;
    if (keyInput && curKey && curKey !== 'YOUR_ANON_KEY') keyInput.value = curKey;

    updateSupabaseIndicator();

    if (saveBtn) {
      saveBtn.onclick = async () => {
        const url = urlInput.value.trim();
        const key = keyInput.value.trim();

        if (!url || !key) {
          alert('Please provide both your Supabase Project URL and Anon Key.');
          return;
        }

        saveBtn.disabled = true;
        saveBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Connecting...';

        window.saveSupabaseCredentials(url, key);

        await updateSupabaseIndicator();

        saveBtn.disabled = false;
        saveBtn.innerHTML = '<i class="fa-solid fa-link"></i> Save Supabase Keys';
        showToast('Supabase credentials saved!');
      };
    }

    async function updateSupabaseIndicator() {
      if (!indicator) return;
      const isConfigured = window.isSupabaseConfigured && window.isSupabaseConfigured();

      if (!isConfigured) {
        indicator.className = 'status-indicator';
        indicator.style.background = 'rgba(255, 255, 255, 0.08)';
        indicator.style.color = '#9ca3af';
        indicator.style.border = '1px solid rgba(255, 255, 255, 0.15)';
        indicator.innerHTML = '<i class="fa-solid fa-cloud"></i><span>Local Mode (Supabase Keys Unset)</span>';
        return;
      }

      const supabase = window.getSupabaseClient();
      if (!supabase) {
        indicator.className = 'status-indicator';
        indicator.style.background = 'rgba(239, 68, 68, 0.12)';
        indicator.style.color = '#f87171';
        indicator.style.border = '1px solid rgba(239, 68, 68, 0.25)';
        indicator.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i><span>Supabase Client Init Error</span>';
        return;
      }

      indicator.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i><span>Testing Supabase Cloud...</span>';

      try {
        const { error } = await supabase.from('portfolio_content').select('id').limit(1);
        if (!error) {
          indicator.className = 'status-indicator';
          indicator.style.background = 'rgba(16, 185, 129, 0.15)';
          indicator.style.color = '#34d399';
          indicator.style.border = '1px solid rgba(16, 185, 129, 0.3)';
          indicator.innerHTML = '<i class="fa-solid fa-cloud-check"></i><span>Supabase Cloud Connected</span>';
        } else {
          indicator.className = 'status-indicator';
          indicator.style.background = 'rgba(245, 158, 11, 0.15)';
          indicator.style.color = '#fbbf24';
          indicator.style.border = '1px solid rgba(245, 158, 11, 0.3)';
          indicator.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i><span>Run supabase_schema.sql in SQL Editor</span>';
        }
      } catch (err) {
        indicator.className = 'status-indicator';
        indicator.style.background = 'rgba(245, 158, 11, 0.15)';
        indicator.style.color = '#fbbf24';
        indicator.style.border = '1px solid rgba(245, 158, 11, 0.3)';
        indicator.innerHTML = '<i class="fa-solid fa-cloud"></i><span>Supabase Offline / Network</span>';
      }
    }
  }
