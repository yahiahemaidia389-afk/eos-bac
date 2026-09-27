const { createClient } = require('@supabase/supabase-js');

const rawUrl = process.env.VITE_SUPABASE_URL || 'https://hngiigrtooyalidmqjar.supabase.co';
const supabaseUrl = rawUrl.replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '');
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhuZ2lpZ3J0b295YWxpZG1xamFyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk5Nzc3MzQsImV4cCI6MjEwNTU1MzczNH0.DmMN5YcsWin_jxu4vcFRp3ElLGKQW56f3AKo04aZSoc';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function runAudit() {
  console.log('--- AUDITING SUPABASE TARGET PROJECT ---');
  console.log('Project URL:', supabaseUrl);

  const tables = ['profiles', 'lessons', 'student_progress', 'student_bookmarks', 'admin_audit_logs'];
  const results = {};

  for (const table of tables) {
    const { data, error } = await supabase.from(table).select('*').limit(1);
    if (error) {
      results[table] = { status: 'MISSING_OR_ERROR', message: error.message, code: error.code };
    } else {
      results[table] = { status: 'READY', rowCount: data.length };
    }
  }

  console.log(JSON.stringify(results, null, 2));
}

runAudit();
