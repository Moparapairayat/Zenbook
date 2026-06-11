import { createClient } from "https://esm.sh/@supabase/supabase-js@2.100.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // Block if already seeded (admin already exists)
    const { data: existingAdmins } = await supabase
      .from("user_roles")
      .select("id")
      .eq("role", "admin")
      .limit(1);

    if (existingAdmins && existingAdmins.length > 0) {
      return new Response(
        JSON.stringify({ error: "Setup already completed. Sign in instead." }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Helper: create user + profile
    const createUser = async (email: string, password: string, displayName: string, bio?: string) => {
      const { data, error } = await supabase.auth.admin.createUser({
        email, password, email_confirm: true,
        user_metadata: { display_name: displayName },
      });
      if (error) throw new Error(`${email}: ${error.message}`);
      const uid = data.user!.id;
      await supabase.from("profiles").upsert(
        { user_id: uid, display_name: displayName, bio: bio || null },
        { onConflict: "user_id" }
      );
      return uid;
    };

    // 1) Admin
    const adminId = await createUser("admin@demo.com", "Admin123!", "Demo Admin", "Platform administrator");
    await supabase.from("user_roles").insert({ user_id: adminId, role: "admin" });

    // 2) Moderator
    const modId = await createUser("moderator@demo.com", "Moderator123!", "Demo Moderator", "Community moderator 🛡️");
    await supabase.from("user_roles").insert({ user_id: modId, role: "moderator" });

    // 3) Regular user
    const userId = await createUser("user@demo.com", "User123!", "Demo User", "Just exploring the platform 👋");

    // 4) Sample posts
    const posts = [
      { user_id: adminId, content: "👋 Welcome to the platform! This is a seeded demo environment — feel free to explore.", privacy: "public" },
      { user_id: modId, content: "Hey everyone! I'll be helping keep things friendly around here. Reach out if you need anything.", privacy: "public" },
      { user_id: userId, content: "Just joined! Excited to see what this community is all about 🎉", privacy: "public" },
      { user_id: userId, content: "Anyone else binge-watching documentaries lately? Drop your favorites below 👇", privacy: "public" },
      { user_id: adminId, content: "Tip: check out the Groups and Events sections to find people with similar interests.", privacy: "public" },
    ];
    await supabase.from("posts").insert(posts);

    // 5) Mark setup complete
    await supabase.from("site_settings").upsert(
      {
        setting_key: "setup_complete",
        setting_value: { completed: true, completedAt: new Date().toISOString(), seeded: true },
        updated_at: new Date().toISOString(),
        updated_by: adminId,
      },
      { onConflict: "setting_key" }
    );

    // 6) Default site identity
    await supabase.from("site_settings").upsert(
      {
        setting_key: "admin_website_info",
        setting_value: { siteName: "WRAPCODERS", siteDescription: "A connected social experience.", siteUrl: "" },
        updated_at: new Date().toISOString(),
        updated_by: adminId,
      },
      { onConflict: "setting_key" }
    );

    return new Response(
      JSON.stringify({
        success: true,
        message: "Demo data seeded successfully.",
        credentials: { email: "admin@demo.com", password: "Admin123!" },
        accounts: [
          { role: "admin", email: "admin@demo.com", password: "Admin123!" },
          { role: "moderator", email: "moderator@demo.com", password: "Moderator123!" },
          { role: "user", email: "user@demo.com", password: "User123!" },
        ],
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
