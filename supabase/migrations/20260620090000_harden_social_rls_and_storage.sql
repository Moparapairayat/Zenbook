-- Harden social privacy, membership, messaging, and media storage policies.

CREATE OR REPLACE FUNCTION public.safe_uuid(value text)
RETURNS uuid
LANGUAGE plpgsql
IMMUTABLE
SET search_path = pg_catalog, pg_temp
AS $$
BEGIN
  RETURN value::uuid;
EXCEPTION WHEN invalid_text_representation THEN
  RETURN NULL;
END;
$$;

CREATE OR REPLACE FUNCTION public.are_friends(_user_id uuid, _other_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT _user_id = _other_id OR EXISTS (
    SELECT 1
    FROM public.friendships
    WHERE status = 'accepted'
      AND (
        (requester_id = _user_id AND addressee_id = _other_id) OR
        (requester_id = _other_id AND addressee_id = _user_id)
      )
  )
$$;

CREATE OR REPLACE FUNCTION public.can_view_post(
  _post_user_id uuid,
  _privacy text,
  _archived boolean,
  _viewer_id uuid
)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT _viewer_id IS NOT NULL AND (
    public.has_role(_viewer_id, 'admin'::public.app_role) OR
    _post_user_id = _viewer_id OR
    (
      COALESCE(_archived, false) = false AND (
        COALESCE(_privacy, 'public') = 'public' OR
        (
          COALESCE(_privacy, 'public') = 'friends' AND
          public.are_friends(_viewer_id, _post_user_id)
        )
      )
    )
  )
$$;

-- Post audience enforcement.
DROP POLICY IF EXISTS "Posts are viewable by authenticated users" ON public.posts;
DROP POLICY IF EXISTS "Posts viewable by audience" ON public.posts;
CREATE POLICY "Posts viewable by audience"
ON public.posts
FOR SELECT TO authenticated
USING (public.can_view_post(user_id, privacy, archived, auth.uid()));

-- Keep comments and reactions aligned with post visibility and comments_disabled.
DROP POLICY IF EXISTS "Comments are viewable by authenticated users" ON public.comments;
DROP POLICY IF EXISTS "Comments visible on viewable posts" ON public.comments;
CREATE POLICY "Comments visible on viewable posts"
ON public.comments
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.posts p
    WHERE p.id = comments.post_id
      AND public.can_view_post(p.user_id, p.privacy, p.archived, auth.uid())
  )
);

DROP POLICY IF EXISTS "Users can create their own comments" ON public.comments;
DROP POLICY IF EXISTS "Users can comment on open viewable posts" ON public.comments;
CREATE POLICY "Users can comment on open viewable posts"
ON public.comments
FOR INSERT TO authenticated
WITH CHECK (
  auth.uid() = user_id AND EXISTS (
    SELECT 1
    FROM public.posts p
    WHERE p.id = comments.post_id
      AND public.can_view_post(p.user_id, p.privacy, p.archived, auth.uid())
      AND (COALESCE(p.comments_disabled, false) = false OR p.user_id = auth.uid())
  )
);

DROP POLICY IF EXISTS "Likes viewable by authenticated" ON public.post_likes;
DROP POLICY IF EXISTS "Likes visible on viewable posts" ON public.post_likes;
CREATE POLICY "Likes visible on viewable posts"
ON public.post_likes
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.posts p
    WHERE p.id = post_likes.post_id
      AND public.can_view_post(p.user_id, p.privacy, p.archived, auth.uid())
  )
);

DROP POLICY IF EXISTS "Users can like" ON public.post_likes;
DROP POLICY IF EXISTS "Users can like viewable posts" ON public.post_likes;
CREATE POLICY "Users can like viewable posts"
ON public.post_likes
FOR INSERT TO authenticated
WITH CHECK (
  auth.uid() = user_id AND EXISTS (
    SELECT 1
    FROM public.posts p
    WHERE p.id = post_likes.post_id
      AND public.can_view_post(p.user_id, p.privacy, p.archived, auth.uid())
  )
);

-- Friend requests must stay pending until the addressee responds.
DROP POLICY IF EXISTS "Users can send friend requests" ON public.friendships;
CREATE POLICY "Users can send friend requests"
ON public.friendships
FOR INSERT TO authenticated
WITH CHECK (
  auth.uid() = requester_id AND
  requester_id <> addressee_id AND
  status = 'pending'
);

DROP POLICY IF EXISTS "Users can update their friendships" ON public.friendships;
CREATE POLICY "Addressees can respond to friend requests"
ON public.friendships
FOR UPDATE TO authenticated
USING (auth.uid() = addressee_id)
WITH CHECK (auth.uid() = addressee_id);

CREATE OR REPLACE FUNCTION public.guard_friendship_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.requester_id IS DISTINCT FROM OLD.requester_id
     OR NEW.addressee_id IS DISTINCT FROM OLD.addressee_id THEN
    RAISE EXCEPTION 'Friendship participants cannot be changed';
  END IF;

  IF auth.uid() IS DISTINCT FROM OLD.addressee_id THEN
    RAISE EXCEPTION 'Only the addressee can respond to a friend request';
  END IF;

  IF OLD.status IS DISTINCT FROM 'pending'
     OR NEW.status NOT IN ('accepted', 'rejected') THEN
    RAISE EXCEPTION 'Invalid friend request status transition';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS guard_friendship_update_trigger ON public.friendships;
CREATE TRIGGER guard_friendship_update_trigger
BEFORE UPDATE ON public.friendships
FOR EACH ROW
EXECUTE FUNCTION public.guard_friendship_update();

-- Group membership must respect privacy and role boundaries.
DROP POLICY IF EXISTS "Users can join public groups or request private" ON public.group_members;
CREATE POLICY "Users can join public groups or request private"
ON public.group_members
FOR INSERT TO authenticated
WITH CHECK (
  (
    auth.uid() = user_id AND role = 'member' AND EXISTS (
      SELECT 1
      FROM public.groups g
      WHERE g.id = group_members.group_id
        AND (
          (g.privacy = 'public' AND group_members.status = 'approved') OR
          (g.privacy = 'private' AND group_members.status = 'pending')
        )
    )
  ) OR (
    auth.uid() = user_id AND role = 'admin' AND status = 'approved' AND EXISTS (
      SELECT 1
      FROM public.groups g
      WHERE g.id = group_members.group_id
        AND g.created_by = auth.uid()
    )
  ) OR (
    public.is_group_admin_or_mod(group_id, auth.uid()) AND
    role = 'member' AND status IN ('approved', 'pending')
  )
);

DROP POLICY IF EXISTS "Admins can update members or self" ON public.group_members;
CREATE POLICY "Admins can update members"
ON public.group_members
FOR UPDATE TO authenticated
USING (public.is_group_admin_or_mod(group_id, auth.uid()))
WITH CHECK (public.is_group_admin_or_mod(group_id, auth.uid()));

-- Message row updates are still needed for read state and pinning, so enforce
-- column-level intent in a trigger.
CREATE OR REPLACE FUNCTION public.guard_message_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _actor uuid := auth.uid();
BEGIN
  IF _actor IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  IF NEW.id IS DISTINCT FROM OLD.id
     OR NEW.conversation_id IS DISTINCT FROM OLD.conversation_id
     OR NEW.sender_id IS DISTINCT FROM OLD.sender_id
     OR NEW.created_at IS DISTINCT FROM OLD.created_at THEN
    RAISE EXCEPTION 'Immutable message fields cannot be changed';
  END IF;

  IF _actor = OLD.sender_id THEN
    IF NEW.attachment_url IS DISTINCT FROM OLD.attachment_url
       OR NEW.attachment_type IS DISTINCT FROM OLD.attachment_type
       OR NEW.attachment_name IS DISTINCT FROM OLD.attachment_name THEN
      RAISE EXCEPTION 'Message attachments cannot be changed after sending';
    END IF;
  ELSE
    IF NEW.content IS DISTINCT FROM OLD.content
       OR NEW.edited_at IS DISTINCT FROM OLD.edited_at
       OR NEW.attachment_url IS DISTINCT FROM OLD.attachment_url
       OR NEW.attachment_type IS DISTINCT FROM OLD.attachment_type
       OR NEW.attachment_name IS DISTINCT FROM OLD.attachment_name THEN
      RAISE EXCEPTION 'Only the sender can edit message content';
    END IF;
  END IF;

  IF NEW.pinned = true AND OLD.pinned IS DISTINCT FROM true
     AND NEW.pinned_by IS DISTINCT FROM _actor THEN
    RAISE EXCEPTION 'pinned_by must match the current user';
  END IF;

  IF NEW.pinned = false AND (
    NEW.pinned_by IS NOT NULL OR NEW.pinned_at IS NOT NULL
  ) THEN
    RAISE EXCEPTION 'Unpinned messages cannot retain pin metadata';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS guard_message_update_trigger ON public.messages;
CREATE TRIGGER guard_message_update_trigger
BEFORE UPDATE ON public.messages
FOR EACH ROW
EXECUTE FUNCTION public.guard_message_update();

-- Storage policies: keep reads public for public buckets, scope writes by
-- owner/member/admin instead of bucket-only checks.
DROP POLICY IF EXISTS "Authenticated users can upload post videos" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload post videos" ON storage.objects;
CREATE POLICY "Users can upload own post videos"
ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'post-videos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

DROP POLICY IF EXISTS "Authenticated users can upload group images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete group images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update group images" ON storage.objects;
CREATE POLICY "Group members can upload group images"
ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'group-images' AND (
    public.is_group_member(public.safe_uuid((storage.foldername(name))[1]), auth.uid()) OR
    public.is_group_admin_or_mod(public.safe_uuid((storage.foldername(name))[1]), auth.uid())
  )
);

CREATE POLICY "Group admins or owners can update group images"
ON storage.objects
FOR UPDATE TO authenticated
USING (
  bucket_id = 'group-images' AND (
    public.is_group_admin_or_mod(public.safe_uuid((storage.foldername(name))[1]), auth.uid()) OR
    (
      (storage.foldername(name))[2] = auth.uid()::text AND
      public.is_group_member(public.safe_uuid((storage.foldername(name))[1]), auth.uid())
    )
  )
)
WITH CHECK (
  bucket_id = 'group-images' AND (
    public.is_group_admin_or_mod(public.safe_uuid((storage.foldername(name))[1]), auth.uid()) OR
    (
      (storage.foldername(name))[2] = auth.uid()::text AND
      public.is_group_member(public.safe_uuid((storage.foldername(name))[1]), auth.uid())
    )
  )
);

CREATE POLICY "Group admins or owners can delete group images"
ON storage.objects
FOR DELETE TO authenticated
USING (
  bucket_id = 'group-images' AND (
    public.is_group_admin_or_mod(public.safe_uuid((storage.foldername(name))[1]), auth.uid()) OR
    (
      (storage.foldername(name))[2] = auth.uid()::text AND
      public.is_group_member(public.safe_uuid((storage.foldername(name))[1]), auth.uid())
    )
  )
);

DROP POLICY IF EXISTS "Authenticated users can upload page images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own page images" ON storage.objects;
CREATE POLICY "Page admins can upload page images"
ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'page-images' AND
  public.is_page_admin(public.safe_uuid((storage.foldername(name))[1]), auth.uid())
);

CREATE POLICY "Page admins can delete page images"
ON storage.objects
FOR DELETE TO authenticated
USING (
  bucket_id = 'page-images' AND
  public.is_page_admin(public.safe_uuid((storage.foldername(name))[1]), auth.uid())
);
