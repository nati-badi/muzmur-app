import json
import re
import os

def extract_translations():
    json_path = r'c:\Users\menta\Desktop\muzmur app\src\data\mezmurs.json'
    
    with open(json_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    # Pattern to match "\n\nትርጉም" followed by optional punctuation/whitespace and a newline
    # This covers various separators like "ትርጉም፡-", "ትርጉም -", etc.
    separator_pattern = re.compile(r'\n\s*ትርጉም\s*[:፡]?\s*[-–—]?\s*\n+', re.MULTILINE)
    
    updated_count = 0
    for item in data:
        lyrics = item.get('lyrics', '')
        
        # Check if translation is already separated (if the key exists and has content)
        # However, the user said some don't have the key, so we check if it's in the lyrics.
        if 'ትርጉም' in lyrics:
            match = separator_pattern.search(lyrics)
            if match:
                start, end = match.span()
                main_lyrics = lyrics[:start].strip()
                translation = lyrics[end:].strip()
                
                item['lyrics'] = main_lyrics
                item['translation'] = translation
                updated_count += 1
            else:
                # Fallback: if the pattern doesn't match perfectly but "ትርጉም" is there, 
                # maybe it's just plain "ትርጉም:" with no double newline
                fallback_match = re.search(r'\n\s*ትርጉም\s*[:፡]?\s*[-–—]?', lyrics)
                if fallback_match:
                    start, end = fallback_match.span()
                    main_lyrics = lyrics[:start].strip()
                    translation = lyrics[end:].strip()
                    # Clean up "ትርጉም" header if it stayed in the translation
                    translation = re.sub(r'^[:፡]?\s*[-–—]?\s*', '', translation)
                    
                    item['lyrics'] = main_lyrics
                    item['translation'] = translation
                    updated_count += 1

    # Save the updated data
    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    
    print(f"Extraction complete. Updated {updated_count} mezmurs.")

if __name__ == '__main__':
    extract_translations()
