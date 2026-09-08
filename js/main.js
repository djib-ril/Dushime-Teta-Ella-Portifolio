// DUSHIME Teta Ella - E-Portfolio Main Script

document.addEventListener('DOMContentLoaded', () => {
  let portfolioData = null;
  let activeContactEmail = 'tetaelladushime@gmail.com';

  // Initialize Portfolio
  initPortfolio();

  // Initialize Interactive Elements
  initNavigation();
  initAdminModal();
  initContactForm();

  async function initPortfolio() {
    // 1. Attempt fetching live data from Supabase first
    const supabase = typeof window.getSupabaseClient === 'function' ? window.getSupabaseClient() : null;
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('portfolio_content')
          .select('content')
          .eq('id', 'main_portfolio')
          .single();

        if (data && data.content && !error) {
          portfolioData = data.content;
          console.log('Successfully fetched live portfolio data from Supabase!');
        } else if (error) {
          console.warn('Supabase query returned error (table might need setup):', error.message);
        }
      } catch (supErr) {
        console.warn('Supabase fetch error, falling back to local server:', supErr);
      }
    }

    // 2. Fallback to local server API /api/content if not retrieved from Supabase
    if (!portfolioData) {
      try {
        const response = await fetch('/api/content', { cache: 'no-store' });
        if (response.ok) {
          portfolioData = await response.json();
        } else {
          throw new Error('API unavailable, checking local storage');
        }
      } catch (err) {
        console.warn('Loading from localStorage or default dataset:', err);
        const cached = localStorage.getItem('teta_ella_portfolio_data');
        if (cached) {
          portfolioData = JSON.parse(cached);
        }
      }
    }

    if (portfolioData) {
      renderAll(portfolioData);
    }
  }

  function renderAll(data) {
    // 1. Hero Section
    if (data.hero) {
      const { greeting, name, bio, profileImage, roles, cvUrl } = data.hero;
      if (greeting) document.getElementById('heroGreeting').textContent = greeting;
      
      if (name) {
        const parts = name.split(' ');
        if (parts.length >= 3) {
          document.getElementById('heroName').innerHTML = `${parts[0]}<br><span class="gold-text">${parts.slice(1).join(' ')}</span>`;
        } else {
          document.getElementById('heroName').innerHTML = `<span class="gold-text">${name}</span>`;
        }
      }

      if (bio) document.getElementById('heroBio').textContent = bio;
      
      if (profileImage) {
        const img = document.getElementById('heroProfileImg');
        img.src = profileImage;
        img.onerror = () => { img.src = 'images/sample.webp'; };
      }

      if (cvUrl && cvUrl !== '#') {
        const cvBtn = document.getElementById('cvDownloadBtn');
        if (cvBtn) {
          cvBtn.href = cvUrl;
          cvBtn.setAttribute('target', '_blank');
        }
      }

      // Render Hero Role Badges
      if (roles && Array.isArray(roles)) {
        const rolesList = document.getElementById('heroRolesList');
        rolesList.innerHTML = roles.map(role => `
          <div class="role-badge-item">
            <div class="role-icon-circle">
              <i class="fa-solid fa-${getIconName(role.icon || role.title)}"></i>
            </div>
            <div class="role-text-col">
              <h4>${escapeHtml(role.title)}</h4>
              <p>${escapeHtml(role.desc)}</p>
            </div>
          </div>
        `).join('');
      }
    }

    // 2. About Me Section
    if (data.about) {
      const { paragraphs, stats } = data.about;
      if (paragraphs && Array.isArray(paragraphs)) {
        const aboutP = document.getElementById('aboutParagraphs');
        aboutP.innerHTML = paragraphs.map(p => `<p>${escapeHtml(p)}</p>`).join('');
      }

      if (stats && Array.isArray(stats)) {
        const highlightsContainer = document.getElementById('highlightsContainer');
        const statIcons = ['folder-open', 'award', 'users', 'heart'];
        highlightsContainer.innerHTML = stats.map((st, idx) => `
          <div class="highlight-stat-card">
            <div class="stat-icon-box">
              <i class="fa-solid fa-${statIcons[idx % statIcons.length]}"></i>
            </div>
            <div>
              <div class="stat-value">${escapeHtml(st.number)}</div>
              <div class="stat-label">${escapeHtml(st.label)}</div>
            </div>
          </div>
        `).join('');
      }
    }

    // 3. Skills Section
    if (data.skills) {
      renderSkillsCategory('business', data.skills);
      initSkillTabs(data.skills);
    }

    // 4. Featured Projects Section
    if (data.projects && Array.isArray(data.projects)) {
      const projectsGrid = document.getElementById('projectsGrid');
      projectsGrid.innerHTML = data.projects.map(proj => `
        <article class="project-card">
          <div class="project-img-wrapper">
            <img src="${escapeHtml(proj.image || 'images/sample.webp')}" alt="${escapeHtml(proj.title)}" loading="lazy">
            <span class="project-category-tag">${escapeHtml(proj.category || 'Project')}</span>
          </div>
          <div class="project-body">
            <h3 class="project-title">${escapeHtml(proj.title)}</h3>
            <p class="project-desc">${escapeHtml(proj.description)}</p>
            <div class="project-tags">
              ${(proj.tags || []).map(t => `<span class="tag-badge">${escapeHtml(t)}</span>`).join('')}
            </div>
          </div>
        </article>
      `).join('');
    }

    // 5. Programs & Experiences Section
    if (data.programs && Array.isArray(data.programs)) {
      const programsGrid = document.getElementById('programsGrid');
      programsGrid.innerHTML = data.programs.map(prog => `
        <div class="program-card">
          <span class="program-badge">${escapeHtml(prog.badge || 'Program')}</span>
          <h3 class="program-title">${escapeHtml(prog.title)}</h3>
          <div class="program-org">
            <i class="fa-solid fa-building-columns"></i>
            <span>${escapeHtml(prog.organization)} • ${escapeHtml(prog.period)}</span>
          </div>
          <p class="program-desc">${escapeHtml(prog.description)}</p>
        </div>
      `).join('');
    }

    // 6. Leadership & Clubs Timeline
    if (data.clubs && Array.isArray(data.clubs)) {
      const leadershipTimeline = document.getElementById('leadershipTimeline');
      leadershipTimeline.innerHTML = data.clubs.map(club => `
        <div class="timeline-item">
          <div class="timeline-dot"></div>
          <div class="timeline-content">
            <div class="timeline-header">
              <h3 class="club-name">${escapeHtml(club.name)}</h3>
              <span class="club-period">${escapeHtml(club.period)}</span>
            </div>
            <div class="club-role">${escapeHtml(club.role)}</div>
            <p class="club-desc">${escapeHtml(club.description)}</p>
          </div>
        </div>
      `).join('');
    }

    // 7. Vision Section
    if (data.vision) {
      if (data.vision.quote) {
        document.getElementById('visionQuote').textContent = `"${data.vision.quote}"`;
      }
      if (data.vision.secondary) {
        document.getElementById('visionSubtext').textContent = data.vision.secondary;
      }
    }

    // 8. Contact Section
    if (data.contact) {
      const { email, location, school, phone, linkedin, github } = data.contact;
      if (email) {
        activeContactEmail = email.trim();

        const contactEmail = document.getElementById('contactEmail');
        if (contactEmail) {
          contactEmail.textContent = activeContactEmail;
          contactEmail.href = `mailto:${activeContactEmail}`;
        }
        
        const heroEmailLink = document.getElementById('heroEmailLink');
        if (heroEmailLink) heroEmailLink.href = `mailto:${activeContactEmail}`;
        
        const footerEmail = document.getElementById('footerEmail');
        if (footerEmail) footerEmail.href = `mailto:${activeContactEmail}`;

        // Dynamically update form action to match live email from Supabase
        const contactForm = document.getElementById('contactForm');
        if (contactForm) {
          contactForm.action = `https://formsubmit.co/${encodeURIComponent(activeContactEmail)}`;
        }
      }

      if (location) {
        document.getElementById('contactLocation').textContent = location;
      }

      if (school) {
        document.getElementById('contactSchool').textContent = school;
      }

      if (phone) {
        document.getElementById('contactPhone').textContent = phone;
      }

      if (linkedin) {
        const heroLinkedin = document.getElementById('heroLinkedin');
        if (heroLinkedin) heroLinkedin.href = linkedin;
        const footerLinkedin = document.getElementById('footerLinkedin');
        if (footerLinkedin) footerLinkedin.href = linkedin;
      }

      if (github) {
        const heroGithub = document.getElementById('heroGithub');
        if (heroGithub) heroGithub.href = github;
        const footerGithub = document.getElementById('footerGithub');
        if (footerGithub) footerGithub.href = github;
      }
    }
  }

  // Skills Tabs & Progress Renderer
  function initSkillTabs(skills) {
    const tabs = document.querySelectorAll('.skill-tab-btn');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const category = tab.getAttribute('data-cat');
        renderSkillsCategory(category, skills);
      });
    });
  }

  function renderSkillsCategory(cat, skills) {
    const container = document.getElementById('skillsContainer');
    const list = skills[cat] || [];
    container.innerHTML = list.map(item => `
      <div class="skill-progress-item">
        <div class="skill-info">
          <span>${escapeHtml(item.name)}</span>
          <span>${item.level}%</span>
        </div>
        <div class="progress-track">
          <div class="progress-fill" style="width: ${item.level}%;"></div>
        </div>
      </div>
    `).join('');
  }

  // Helper for icon matching
  function getIconName(str) {
    const s = (str || '').toLowerCase();
    if (s.includes('briefcase') || s.includes('business')) return 'briefcase';
    if (s.includes('cart') || s.includes('commerce') || s.includes('shop')) return 'cart-shopping';
    if (s.includes('pen') || s.includes('palette') || s.includes('design')) return 'pen-nib';
    if (s.includes('code') || s.includes('tech') || s.includes('program')) return 'code';
    if (s.includes('user') || s.includes('leader')) return 'users';
    return 'star';
  }

  // Navigation and Mobile Menu
  function initNavigation() {
    const mobileToggle = document.getElementById('mobileToggle');
    const mainNav = document.getElementById('mainNav');
    const navList = mainNav ? mainNav.querySelector('.nav-list') : null;

    if (mobileToggle && navList) {
      mobileToggle.addEventListener('click', () => {
        navList.classList.toggle('open');
      });

      navList.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
          navList.classList.remove('open');
        });
      });
    }

    // Scroll active link highlight
    const sections = document.querySelectorAll('main section[id]');
    window.addEventListener('scroll', () => {
      let scrollY = window.pageYOffset;
      sections.forEach(current => {
        const sectionHeight = current.offsetHeight;
        const sectionTop = current.offsetTop - 120;
        const sectionId = current.getAttribute('id');
        const link = document.querySelector(`.nav-list a[href*='${sectionId}']`);
        if (link) {
          if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
            link.classList.add('active');
          } else {
            link.classList.remove('active');
          }
        }
      });
    });
  }

  // Admin Login Modal Behavior
  function initAdminModal() {
    const modal = document.getElementById('adminLoginModal');
    const openBtn = document.getElementById('openAdminModalBtn');
    const closeBtn = document.getElementById('closeAdminModalBtn');
    const form = document.getElementById('adminLoginForm');
    const errorAlert = document.getElementById('loginErrorMessage');
    const errorText = document.getElementById('loginErrorText');

    if (!modal) return;

    openBtn.addEventListener('click', () => {
      errorAlert.style.display = 'none';
      form.reset();
      if (typeof modal.showModal === 'function') {
        modal.showModal();
      } else {
        modal.setAttribute('open', '');
      }
    });

    const closeModal = () => {
      if (typeof modal.close === 'function') {
        modal.close();
      } else {
        modal.removeAttribute('open');
      }
    };

    closeBtn.addEventListener('click', closeModal);

    // Close on backdrop click
    modal.addEventListener('click', (e) => {
      const rect = modal.getBoundingClientRect();
      const isInDialog = (
        rect.top <= e.clientY && e.clientY <= rect.top + rect.height &&
        rect.left <= e.clientX && e.clientX <= rect.left + rect.width
      );
      if (e.target === modal && !isInDialog) {
        closeModal();
      }
    });

    // Form Submission
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const username = document.getElementById('adminUsername').value.trim();
      const password = document.getElementById('adminPassword').value.trim();
      const submitBtn = document.getElementById('loginSubmitBtn');

      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Authenticating...';
      errorAlert.style.display = 'none';

      try {
        let authSuccess = false;

        // First attempt server login
        try {
          const res = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
          });
          const data = await res.json();
          if (res.ok && data.success) {
            authSuccess = true;
            sessionStorage.setItem('teta_ella_auth_token', data.token || 'valid_token');
          }
        } catch (apiErr) {
          console.warn('API login request failed, evaluating client check:', apiErr);
          // Fallback client check
          if (username === 'admin' && password === 'ella') {
            authSuccess = true;
            sessionStorage.setItem('teta_ella_auth_token', 'local_valid_token');
          }
        }

        if (authSuccess) {
          sessionStorage.setItem('ella_admin_authenticated', 'true');
          showToast('Welcome back, Admin! Redirecting to editor...');
          setTimeout(() => {
            window.location.href = 'admin.html';
          }, 800);
        } else {
          errorText.textContent = 'Invalid credentials. Use admin and ella.';
          errorAlert.style.display = 'flex';
          submitBtn.disabled = false;
          submitBtn.innerHTML = '<span>LOG IN TO DASHBOARD</span><i class="fa-solid fa-arrow-right-to-bracket"></i>';
        }
      } catch (err) {
        errorText.textContent = 'An error occurred. Please try again.';
        errorAlert.style.display = 'flex';
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<span>LOG IN TO DASHBOARD</span><i class="fa-solid fa-arrow-right-to-bracket"></i>';
      }
    });
  }

  // Contact Form with Dynamic Email Target & Seamless AJAX Submission
  function initContactForm() {
    const contactForm = document.getElementById('contactForm');
    const formStatus = document.getElementById('formStatus');
    const sendBtn = document.getElementById('sendMessageBtn');

    if (!contactForm) return;

    contactForm.addEventListener('submit', async (e) => {
      // Prevent standard navigation / external redirect
      e.preventDefault();

      const nameInput = document.getElementById('senderName');
      const emailInput = document.getElementById('senderEmail');
      const messageInput = document.getElementById('senderMessage');
      const honeyInput = contactForm.querySelector('input[name="_honey"]');

      // Check honeypot spam protection
      if (honeyInput && honeyInput.value) {
        console.warn('Bot submission blocked');
        return;
      }

      const name = nameInput ? nameInput.value.trim() : '';
      const email = emailInput ? emailInput.value.trim() : '';
      const message = messageInput ? messageInput.value.trim() : '';

      if (!name || !email || !message) {
        formStatus.innerHTML = '<span style="color: #ef4444;"><i class="fa-solid fa-circle-exclamation"></i> Please fill in your name, email, and message.</span>';
        return;
      }

      // 1. Dynamic Email Target from live Supabase data (or fallback)
      const targetEmail = (activeContactEmail || 'tetaelladushime@gmail.com').trim();
      const endpoint = `https://formsubmit.co/ajax/${encodeURIComponent(targetEmail)}`;

      const originalBtnHtml = sendBtn ? sendBtn.innerHTML : '<span>SEND MESSAGE</span><i class="fa-solid fa-paper-plane"></i>';
      if (sendBtn) {
        sendBtn.disabled = true;
        sendBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Sending message...';
      }

      formStatus.innerHTML = '<span style="color: var(--gold-primary);"><i class="fa-solid fa-paper-plane fa-fade"></i> Sending your message...</span>';

      let emailSuccess = false;

      try {
        // 2. Seamless AJAX Submission using FormSubmit AJAX endpoint
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            name: name,
            email: email,
            message: message,
            _subject: `New Portfolio Message from ${name}`,
            _captcha: 'false',
            _template: 'table'
          })
        });

        const resData = await response.json().catch(() => ({}));
        if (response.ok || resData.success === 'true' || resData.success === true) {
          emailSuccess = true;
        } else {
          console.warn('FormSubmit returned non-ok status:', response.status, resData);
        }
      } catch (fetchErr) {
        console.warn('AJAX fetch to FormSubmit encountered an issue:', fetchErr);
      }

      // Also record message locally to server archive if local server is active
      try {
        await fetch('/api/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name,
            email,
            message,
            targetEmail,
            date: new Date().toISOString()
          })
        });
      } catch (localErr) {
        // Silent fallback
      }

      if (emailSuccess) {
        // 3. Display clean, seamless success alert directly on the page without redirect
        formStatus.innerHTML = `
          <div style="color: #34d399; background: rgba(16, 185, 129, 0.12); border: 1px solid rgba(16, 185, 129, 0.3); padding: 0.85rem 1.2rem; border-radius: 10px; margin-top: 0.8rem; font-size: 0.88rem; line-height: 1.5;">
            <i class="fa-solid fa-circle-check" style="font-size: 1rem; margin-right: 0.4rem;"></i>
            Thank you, <strong>${escapeHtml(name)}</strong>! Your message has been sent successfully. We will get back to you shortly.
          </div>
        `;
        contactForm.reset();
        showToast('Message sent successfully!');
      } else {
        // Fallback message if network or third-party endpoint had a transient issue
        formStatus.innerHTML = `
          <div style="color: #fce0bb; background: rgba(223, 176, 122, 0.12); border: 1px solid rgba(223, 176, 122, 0.3); padding: 0.85rem 1.2rem; border-radius: 10px; margin-top: 0.8rem; font-size: 0.88rem;">
            <i class="fa-solid fa-envelope" style="margin-right: 0.4rem;"></i>
            Thank you, ${escapeHtml(name)}! If your message doesn't arrive, <a href="mailto:${encodeURIComponent(targetEmail)}?subject=Portfolio%20Inquiry%20from%20${encodeURIComponent(name)}&body=${encodeURIComponent(message)}" style="color: var(--gold-bright); text-decoration: underline;">click here to send directly to ${escapeHtml(targetEmail)}</a>.
          </div>
        `;
        contactForm.reset();
        showToast('Message prepared!');
      }

      if (sendBtn) {
        sendBtn.disabled = false;
        sendBtn.innerHTML = originalBtnHtml;
      }

      setTimeout(() => {
        if (formStatus.textContent.includes('Thank you')) {
          formStatus.innerHTML = '';
        }
      }, 12000);
    });
  }

  // Toast Helper
  function showToast(msg) {
    const toast = document.getElementById('toastNotification');
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 3500);
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
