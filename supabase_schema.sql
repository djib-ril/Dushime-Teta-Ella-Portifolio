-- ==========================================================
-- DUSHIME Teta Ella Portfolio - Supabase Database & Storage Setup
-- Run this in your Supabase SQL Editor (Dashboard -> SQL Editor)
-- ==========================================================

-- 1. Create the portfolio_content table
create table if not exists public.portfolio_content (
  id text primary key default 'main_portfolio',
  content jsonb not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table public.portfolio_content enable row level security;

-- Policy 1: Allow public read access so everyone can see the portfolio
drop policy if exists "Public can view portfolio content" on public.portfolio_content;
create policy "Public can view portfolio content"
  on public.portfolio_content
  for select
  using (true);

-- Policy 2: Allow insert & update for saving changes
drop policy if exists "Allow content modifications" on public.portfolio_content;
create policy "Allow content modifications"
  on public.portfolio_content
  for all
  using (true)
  with check (true);

-- 2. Create the Storage Bucket for Portfolio Pictures
insert into storage.buckets (id, name, public)
values ('portfolio-pictures', 'portfolio-pictures', true)
on conflict (id) do update set public = true;

-- Storage Policies for 'portfolio-pictures'
drop policy if exists "Public Access for Portfolio Pictures" on storage.objects;
create policy "Public Access for Portfolio Pictures"
  on storage.objects for select
  using (bucket_id = 'portfolio-pictures');

drop policy if exists "Allow uploads to Portfolio Pictures" on storage.objects;
create policy "Allow uploads to Portfolio Pictures"
  on storage.objects for insert
  with check (bucket_id = 'portfolio-pictures');

drop policy if exists "Allow updates to Portfolio Pictures" on storage.objects;
create policy "Allow updates to Portfolio Pictures"
  on storage.objects for update
  using (bucket_id = 'portfolio-pictures');

-- 3. Seed Initial Content into portfolio_content
insert into public.portfolio_content (id, content, updated_at)
values ('main_portfolio', '{"hero": {"greeting": "Hello, I''m", "name": "DUSHIME Teta Ella", "title": "Aspiring Businesswoman | Digital Commerce Enthusiast | Creative Designer", "bio": "I am an aspiring businesswoman, leadership enthusiast, digital commerce enthusiast, and creative designer from Rwanda who is passionate about combining leadership, business, technology, and creativity to create solutions that help people and communities. I enjoy learning new skills, exploring entrepreneurship, and using technology as a tool for innovation and impact.", "profileImage": "uploads/teta_ella_portrait_1788877270615.jpg", "cvUrl": "#", "roles": [{"title": "Aspiring Businesswoman", "desc": "Liquidnet Family High School at ASYV (MPGE)", "icon": "briefcase"}, {"title": "Digital Commerce Enthusiast", "desc": "Exploring online business & digital growth", "icon": "shopping-bag"}, {"title": "Creative Designer", "desc": "Designing visual projects with Canva & Figma", "icon": "palette"}, {"title": "Tech Enthusiast", "desc": "Coding in HTML, CSS, JavaScript, and C++", "icon": "code"}, {"title": "Youth Leader", "desc": "Inspiring girls in business and STEM", "icon": "users"}]}, "about": {"headline": "Curious student driven by leadership, business, technology, and community impact.", "paragraphs": ["I am a motivated and curious student who enjoys learning beyond the classroom. My interests are centered around leadership, business, digital commerce, entrepreneurship, technology, creativity, and community impact.", "I am currently a student at Liquidnet Family High School at Agahozo-Shalom Youth Village, where I study Mathematics, Physics, Geography, and Economics (MPGE). Alongside academics, I actively participate in leadership programs, technology initiatives, entrepreneurship activities, and community service.", "I believe that young people can use technology and innovation to create positive change in society. Because of this belief, I actively participate in programs and activities that help me grow my skills in communication, teamwork, technology, and problem-solving.", "I also enjoy creative design work using tools like Canva and Figma, where I create digital designs such as Save the Date templates and visual projects. In the future, I hope to build my own successful business while continuing to grow in the technology and digital commerce world."], "stats": [{"number": "3+", "label": "Featured Projects"}, {"number": "3+", "label": "Programs & Trainings"}, {"number": "4+", "label": "Clubs & Leadership"}, {"number": "100%", "label": "Dedication & Drive"}]}, "skills": {"business": [{"name": "Entrepreneurship", "level": 92}, {"name": "Business Fundamentals", "level": 88}, {"name": "Digital Commerce", "level": 90}, {"name": "Financial Literacy", "level": 85}, {"name": "Project Planning", "level": 88}], "tech": [{"name": "HTML & CSS (Beginner)", "level": 80}, {"name": "JavaScript (Beginner)", "level": 75}, {"name": "C++ (Beginner)", "level": 70}, {"name": "Figma UI/UX", "level": 85}, {"name": "Canva Creative Suite", "level": 95}], "soft": [{"name": "Leadership & Strategy", "level": 95}, {"name": "Decision Making", "level": 88}, {"name": "Confidence Building", "level": 92}, {"name": "Teamwork & Collaboration", "level": 96}, {"name": "Communication & Public Speaking", "level": 92}, {"name": "Problem Solving & Active Listening", "level": 90}]}, "projects": [{"id": "proj-1", "title": "Save the Date Design Business", "category": "Digital Commerce & Creative Design", "description": "Started designing creative Save the Date templates using Canva with the goal of building a digital design business. Focused on elegant visual aesthetics, personalized typography, and client-tailored digital invitations.", "tags": ["Canva", "Digital Commerce", "Branding", "Entrepreneurship"], "image": "images/sample.webp", "link": "#"}, {"id": "proj-2", "title": "Homefinder Website Concept", "category": "Web Development & UI/UX Concept", "description": "Developed a website idea focused on helping people explore and find homes online while learning web development and design concepts. Built with a focus on trust, security, and intuitive search.", "tags": ["HTML & CSS", "JavaScript", "Web Concept", "Housing Tech"], "image": "images/umurava(102).jpg", "link": "#"}, {"id": "proj-3", "title": "STEM & Technology Projects", "category": "STEM & Collaborative Innovation", "description": "Participated in collaborative group technology and presentation projects involving creativity, teamwork, and innovation, exploring coding principles and practical tech solutions.", "tags": ["STEM", "Teamwork", "C++", "Innovation"], "image": "images/umurava(105).jpg", "link": "#"}], "programs": [{"id": "prog-1", "title": "Access English Program", "badge": "Communication & Leadership", "organization": "English Access Microscholarship Program", "period": "2023 - 2024", "description": "Participant in the English Access Microscholarship Program, where I improved my English communication, leadership, confidence, teamwork, and presentation skills through academic and community-based activities."}, {"id": "prog-2", "title": "HerInTech Summer Camp", "badge": "Web Tech & Design", "organization": "HerInTech Initiative", "period": "Summer 2024", "description": "Participated in HerInTech Summer Camp and learned technology and design skills including HTML, CSS, JavaScript, and Figma. The experience strengthened my passion for combining creativity and technology."}, {"id": "prog-3", "title": "Programming Classes", "badge": "Coding Fundamentals", "organization": "Tech Learning Track", "period": "2024 - Present", "description": "Attended beginner programming classes and explored coding fundamentals including HTML, CSS, and C++."}], "clubs": [{"id": "club-1", "name": "Girl Up Club", "role": "Active Member & Advocate", "period": "2023 - Present", "description": "Participated in activities focused on empowering girls and supporting young women in the community."}, {"id": "club-2", "name": "Business Club", "role": "Member & Project Contributor", "period": "2023 - Present", "description": "Explored entrepreneurship concepts, business ideas, and teamwork through school-based projects and discussions."}, {"id": "club-3", "name": "Economic Club", "role": "Member & Financial Learner", "period": "2024 - Present", "description": "Learned financial and economic concepts while developing interest in financial literacy and business thinking."}, {"id": "club-4", "name": "Pay It Forward Club", "role": "Community Volunteer", "period": "2023 - Present", "description": "Contributed to community service activities and teamwork projects focused on helping others."}], "vision": {"quote": "My goal is to grow into a successful entrepreneur, leader, and digital commerce professional who uses creativity and technology to solve real-world problems while inspiring other young girls to believe in themselves, become confident leaders, and explore opportunities in business and STEM.", "secondary": "I want to become a successful entrepreneur and digital commerce professional who combines technology, creativity, and business to create opportunities and solutions for people."}, "contact": {"fullName": "DUSHIME Teta Ella", "location": "Kigali, Rwanda", "school": "Liquidnet Family High School at Agahozo-Shalom Youth Village", "combination": "Mathematics, Physics, Geography, and Economics (MPGE)", "email": "tetaelladushime@gmail.com", "phone": "+250 788 000 000", "linkedin": "https://linkedin.com/in/teta-ella", "github": "https://github.com/teta-ella"}}'::jsonb, now())
on conflict (id) do nothing;

-- 4. Enable realtime so open portfolio tabs update as soon as admin saves
alter table public.portfolio_content replica identity full;
do $$
begin
  begin
    alter publication supabase_realtime add table public.portfolio_content;
  exception
    when duplicate_object then
      null;
  end;
end $$;

-- Done! Your database table, storage bucket, and realtime publication are ready.
