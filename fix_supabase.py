import os
import re

directory = r'c:\Users\Vihaa\Desktop\BoardVerse AI\src\app'
for root, _, files in os.walk(directory):
    for file in files:
        if file.endswith('.ts') or file.endswith('.tsx'):
            filepath = os.path.join(root, file)
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
            
            if '@/utils/supabase/server' in content:
                new_content = content.replace('const supabase = createClient();', 'const supabase = await createClient();')
                if new_content != content:
                    with open(filepath, 'w', encoding='utf-8') as f:
                        f.write(new_content)
                    print(f'Updated {filepath}')
