-- ==============================================================================
-- EOS BAC Supabase Schema: Roles, Profiles, RLS, and Administrator Permissions
-- ==============================================================================

-- 1. Create enum for user roles: strictly student or admin
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    CREATE TYPE user_role AS ENUM ('student', 'admin');
  END IF;
END $$;

-- 2. Create the profiles table according to exact required specification
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('student', 'admin')) DEFAULT 'student',
  stream TEXT, -- Nullable for new Google students awaiting stream onboarding
  language TEXT NOT NULL DEFAULT 'fr' CHECK (language IN ('fr', 'en', 'ar')),
  avatar_url TEXT,
  dream TEXT,
  goal TEXT,
  target_score TEXT,
  study_focus TEXT,
  onboarding_completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Safe migrations for existing profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS dream TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS goal TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS target_score TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS study_focus TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN NOT NULL DEFAULT false;

-- Indexes for fast lookup, role checks, and pagination
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_stream ON public.profiles(stream);
CREATE INDEX IF NOT EXISTS idx_profiles_onboarding ON public.profiles(onboarding_completed);
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON public.profiles(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_full_name ON public.profiles(full_name);

-- 3. Function to check if the executing user is an administrator
-- Hardened with SECURITY DEFINER and fixed search_path to prevent hijacking
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- 4. Enable Row Level Security on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policy 1: Students can view ONLY their own profile; Admins can view all profiles
-- Strictly eliminates public data exposure (NO USING (true) allowed)
DROP POLICY IF EXISTS "Profiles are viewable by authenticated users" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile or admin can view all" ON public.profiles;
CREATE POLICY "Users can view own profile or admin can view all"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id OR public.is_admin());

-- Policy 2: Users can update own profile (strictly guarded by trigger & auth.uid())
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Policy 3: Admins can update any profile (promotion/demotion/management)
DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;
CREATE POLICY "Admins can update any profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Policy 4: Users can insert own profile as student on initial auth fallback
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id AND role = 'student');

-- Policy 5: Admins can insert profiles
DROP POLICY IF EXISTS "Admins can insert profiles" ON public.profiles;
CREATE POLICY "Admins can insert profiles"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

-- 4b. Strict Role & ID Protection Trigger
-- Role and ID protection MUST be enforced at database level, not only by client checks.
CREATE OR REPLACE FUNCTION public.protect_profile_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- 1. Forbid altering user primary key (id) under all circumstances
  IF NEW.id IS DISTINCT FROM OLD.id THEN
    RAISE EXCEPTION 'Access Denied: User ID cannot be modified.';
  END IF;

  -- 2. If role is being changed:
  IF NEW.role IS DISTINCT FROM OLD.role THEN
    -- Check if executing user is an admin
    IF NOT public.is_admin() THEN
      RAISE EXCEPTION 'Access Denied: Only administrators can modify user roles.';
    END IF;

    -- If an admin is being demoted to student:
    IF OLD.role = 'admin' AND NEW.role != 'admin' THEN
      -- Prevent self-demotion
      IF OLD.id = auth.uid() THEN
        RAISE EXCEPTION 'Operation not allowed: You cannot demote your own admin account.';
      END IF;

      -- Prevent demoting the last remaining administrator
      IF (SELECT count(*) FROM public.profiles WHERE role = 'admin') <= 1 THEN
        RAISE EXCEPTION 'Operation not allowed: Cannot demote the last remaining administrator.';
      END IF;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tr_protect_profile_role ON public.profiles;
CREATE TRIGGER tr_protect_profile_role
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_profile_role();


-- 5. Trigger to automatically create a profile when a new user signs up
-- NOTE: Every public registration MUST ALWAYS default to role = 'student'
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role, stream, language, avatar_url, created_at)
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      split_part(NEW.email, '@', 1),
      'Élève EOS BAC'
    ),
    NEW.email,
    'student', -- ALWAYS student on registration. Never allow admin during public signup.
    NEW.raw_user_meta_data->>'stream', -- NULL for new Google users without stream
    COALESCE(NEW.raw_user_meta_data->>'language', 'fr'),
    COALESCE(
      NEW.raw_user_meta_data->>'avatar_url',
      NEW.raw_user_meta_data->>'picture'
    ),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 6. RPC Secure Functions: Promote to Admin & Demote to Student
CREATE OR REPLACE FUNCTION public.promote_user_to_admin(target_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Verify caller is an admin
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Access denied: Only administrators can promote users.';
  END IF;

  UPDATE public.profiles
  SET role = 'admin'
  WHERE id = target_user_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.demote_admin_to_student(target_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Verify caller is an admin
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Access denied: Only administrators can change roles.';
  END IF;

  -- Prevent admin from accidentally demoting themselves!
  IF target_user_id = auth.uid() THEN
    RAISE EXCEPTION 'Operation not allowed: You cannot demote your own admin account.';
  END IF;

  -- Prevent demoting the last remaining administrator
  IF (SELECT count(*) FROM public.profiles WHERE role = 'admin') <= 1 THEN
    RAISE EXCEPTION 'Operation not allowed: Cannot demote the last remaining administrator.';
  END IF;

  UPDATE public.profiles
  SET role = 'student'
  WHERE id = target_user_id;
END;
$$;

-- 7. Educational Content Tables with strict RLS
-- (Students CAN view published content only; Admins CAN view all and manage)

CREATE TABLE IF NOT EXISTS public.lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id TEXT NOT NULL,
  chapter_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  video_url TEXT,
  pdf_url TEXT,
  content_text TEXT,
  thumbnail_url TEXT,
  published BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Students can view published lessons" ON public.lessons;
CREATE POLICY "Students can view published lessons"
  ON public.lessons FOR SELECT
  TO authenticated, anon
  USING (published = true OR public.is_admin());

DROP POLICY IF EXISTS "Admins can insert lessons" ON public.lessons;
CREATE POLICY "Admins can insert lessons"
  ON public.lessons FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can update lessons" ON public.lessons;
CREATE POLICY "Admins can update lessons"
  ON public.lessons FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can delete lessons" ON public.lessons;
CREATE POLICY "Admins can delete lessons"
  ON public.lessons FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- Indexes for high-throughput educational content retrieval
CREATE INDEX IF NOT EXISTS idx_lessons_subject_chapter ON public.lessons(subject_id, chapter_id);
CREATE INDEX IF NOT EXISTS idx_lessons_published ON public.lessons(published);
CREATE INDEX IF NOT EXISTS idx_lessons_created_at ON public.lessons(created_at DESC);

-- 8. Student Progress Table with strict Student & Admin isolation
CREATE TABLE IF NOT EXISTS public.student_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  subject_id TEXT NOT NULL,
  chapter_id TEXT,
  lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE,
  completed BOOLEAN NOT NULL DEFAULT false,
  score NUMERIC(5,2),
  last_accessed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_student_lesson_progress UNIQUE (user_id, subject_id, lesson_id)
);

ALTER TABLE public.student_progress ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Students can view own progress" ON public.student_progress;
CREATE POLICY "Students can view own progress"
  ON public.student_progress FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Students can insert own progress" ON public.student_progress;
CREATE POLICY "Students can insert own progress"
  ON public.student_progress FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Students can update own progress" ON public.student_progress;
CREATE POLICY "Students can update own progress"
  ON public.student_progress FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Students can delete own progress" ON public.student_progress;
CREATE POLICY "Students can delete own progress"
  ON public.student_progress FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_progress_user ON public.student_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_progress_subject ON public.student_progress(user_id, subject_id);

-- 9. Student Bookmarks Table with strict Student & Admin isolation
CREATE TABLE IF NOT EXISTS public.student_bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  item_type TEXT NOT NULL CHECK (item_type IN ('lesson', 'exam', 'summary', 'exercise')),
  item_id TEXT NOT NULL,
  title TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_student_bookmark UNIQUE (user_id, item_type, item_id)
);

ALTER TABLE public.student_bookmarks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Students can view own bookmarks" ON public.student_bookmarks;
CREATE POLICY "Students can view own bookmarks"
  ON public.student_bookmarks FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Students can insert own bookmarks" ON public.student_bookmarks;
CREATE POLICY "Students can insert own bookmarks"
  ON public.student_bookmarks FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Students can delete own bookmarks" ON public.student_bookmarks;
CREATE POLICY "Students can delete own bookmarks"
  ON public.student_bookmarks FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_bookmarks_user ON public.student_bookmarks(user_id);

-- 10. Admin Audit Logs
CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  target_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  details JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view audit logs" ON public.admin_audit_logs;
CREATE POLICY "Admins can view audit logs"
  ON public.admin_audit_logs FOR SELECT
  TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can insert audit logs" ON public.admin_audit_logs;
CREATE POLICY "Admins can insert audit logs"
  ON public.admin_audit_logs FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE INDEX IF NOT EXISTS idx_audit_admin ON public.admin_audit_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_audit_created ON public.admin_audit_logs(created_at DESC);

-- 11. Performance Optimization: High-performance aggregated stats RPC
-- Avoids transferring full table rows to frontend just to calculate count metrics
CREATE OR REPLACE FUNCTION public.get_users_count()
RETURNS TABLE (total BIGINT, students BIGINT, admins BIGINT)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT 
    COUNT(*)::BIGINT AS total,
    COUNT(*) FILTER (WHERE role = 'student')::BIGINT AS students,
    COUNT(*) FILTER (WHERE role = 'admin')::BIGINT AS admins
  FROM public.profiles;
$$;
