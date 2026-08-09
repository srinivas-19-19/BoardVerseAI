"use server";

import { createClient } from "@/utils/supabase/server";

function getCompilerId(lang: string): string {
  const map: Record<string, string> = {
    python: "cpython-3.14.0",
    javascript: "nodejs-20.17.0",
    java: "openjdk-jdk-22+36",
    c: "gcc-13.2.0-c",
    cpp: "gcc-13.2.0",
  };
  return map[lang] || "cpython-3.14.0";
}

export async function runCode(language: string, code: string): Promise<{ output: string; error: boolean }> {
  try {
    const response = await fetch("https://wandbox.org/api/compile.json", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        compiler: getCompilerId(language),
        code: code,
        save: false,
      })
    });

    const data = await response.json();
    
    // Wandbox returns compiler errors if compilation fails (e.g. C/C++/Java)
    if (data.compiler_error) {
       return { output: data.compiler_error, error: true };
    }
    
    // Wandbox returns runtime output in program_message or program_output
    const output = data.program_message || data.program_error || "Execution finished with no output.";
    
    return { 
      output: output, 
      error: data.status !== "0" 
    };
  } catch (err: any) {
    return { output: `Failed to execute code: ${err.message}`, error: true };
  }
}

export async function saveCodeAction(boardId: string, code: string, language: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  // Update the board with the new code snippet and language
  const { error } = await supabase
    .from("boards")
    .update({ 
      code_snippet: code,
      code_language: language,
      updated_at: new Date().toISOString(),
    })
    .eq("id", boardId);

  if (error) {
    console.error("Failed to save code state:", error);
    throw new Error(error.message);
  }
}
