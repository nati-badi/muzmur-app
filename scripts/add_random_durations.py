import json
import random

def add_random_durations():
    json_path = r'c:\Users\menta\Desktop\muzmur app\src\data\mezmurs.json'
    
    with open(json_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    updated_count = 0
    for item in data:
        if 'duration' not in item or not item['duration'] or item['duration'] == '#':
            # Generate a random duration between 0:45 and 1:45
            minutes = random.randint(0, 1)
            if minutes == 0:
                seconds = random.randint(45, 59)
            else:
                seconds = random.randint(0, 45)
            
            duration_str = f"{minutes}:{seconds:02d}"
            item['duration'] = duration_str
            updated_count += 1

    # Save the updated data
    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    
    print(f"Update complete. Added random durations to {updated_count} mezmurs.")

if __name__ == '__main__':
    add_random_durations()
