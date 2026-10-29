export interface WordItem {
  id: string;
  english: string;
  thai: string;
  category?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
}

export const DEFAULT_RAW_TEXT = `Eat กิน
Sleep นอน
Read อ่านหนังสือ
Run วิ่ง
Drink ดื่มน้ำ
Cook ทำอาหาร
Work ทำงาน
Study เรียนหนังสือ
Listen ฟังเพลง
Walk เดินเล่น`;

export const VOCAB_PRESETS: { name: string; description: string; rawText: string }[] = [
  {
    name: 'กริยาประจำวัน (Daily Verbs)',
    description: 'คำกริยาพื้นฐานที่พบในชีวิตประจำวันทั่วไป',
    rawText: `Eat กิน
Sleep นอน
Read อ่าน
Run วิ่ง
Drink ดื่ม
Cook ทำอาหาร
Work ทำงาน
Study เรียน
Listen ฟัง
Walk เดิน`,
  },
  {
    name: 'อาหารและเครื่องดื่ม (Food & Dining)',
    description: 'คำศัพท์เกี่ยวกับการรับประทาน รสชาติ และอาหาร',
    rawText: `Eat กิน
Drink ดื่ม
Bake อบขนม
Taste ชิมรสชาติ
Chew เคี้ยว
Pour เทน้ำ
Slice หั่นเป็นแผ่น
Boil ต้ม
Fry ทอด
Hungry หิว`,
  },
  {
    name: 'กิจกรรมและการพักผ่อน (Activities & Leisure)',
    description: 'กิจกรรมยามว่าง กีฬา และการพักผ่อนหย่อนใจ',
    rawText: `Swim ว่ายน้ำ
Dance เต้นรำ
Sing ร้องเพลง
Paint วาดรูป
Travel ท่องเที่ยว
Exercise ออกกำลังกาย
Rest พักผ่อน
Play เล่น
Photograph ถ่ายภาพ
Camp ตั้งแคมป์`,
  },
  {
    name: 'ความรู้สึกและอารมณ์ (Emotions & Feelings)',
    description: 'คำบรรยายอารมณ์และความรู้สึก',
    rawText: `Smile ยิ้ม
Laugh หัวเราะ
Cry ร้องไห้
Happy มีความสุข
Tired เหนื่อยล้า
Excited ตื่นเต้น
Surprised ประหลาดใจ
Calm สงบ
Angry โกรธ
Bored เบื่อ`,
  },
];

export interface StarterImageDefinition {
  id: string;
  name: string;
  url: string;
  primaryKeyword: string;
  descriptionHint: string;
}

export const STARTER_IMAGES: StarterImageDefinition[] = [
  {
    id: 'starter-eat',
    name: 'คนรับประทานอาหารอร่อย (Eating meal)',
    url: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&auto=format&fit=crop&q=80',
    primaryKeyword: 'Eat',
    descriptionHint: 'ภาพโต๊ะอาหารพร้อมจานอาหาร บาร์บีคิว คนกำลังร่วมรับประทานอาหาร',
  },
  {
    id: 'starter-sleep',
    name: 'คนนอนหลับบนเตียง (Sleeping in bed)',
    url: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=800&auto=format&fit=crop&q=80',
    primaryKeyword: 'Sleep',
    descriptionHint: 'คนกำลังนอนหลับอย่างสบายและผ่อนคลายบนเตียงนอนหนานุ่ม',
  },
  {
    id: 'starter-read',
    name: 'คนอ่านหนังสือเปิดกว้าง (Reading a book)',
    url: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800&auto=format&fit=crop&q=80',
    primaryKeyword: 'Read',
    descriptionHint: 'คนกำลังถือและอ่านหนังสือในบรรยากาศอบอุ่น',
  },
  {
    id: 'starter-run',
    name: 'คนวิ่งออกกำลังกาย (Running outdoors)',
    url: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=800&auto=format&fit=crop&q=80',
    primaryKeyword: 'Run',
    descriptionHint: 'นักวิ่งกำลังวิ่งจ็อกกิ้งออกกำลังกายท่ามกลางธรรมชาติ',
  },
  {
    id: 'starter-drink',
    name: 'คนดื่มเครื่องดื่มอุ่นๆ (Drinking coffee/tea)',
    url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&auto=format&fit=crop&q=80',
    primaryKeyword: 'Drink',
    descriptionHint: 'คนกำลังยกแก้วดื่มกาแฟลาเต้อุ่นๆ หรือเครื่องดื่ม',
  },
  {
    id: 'starter-cook',
    name: 'คนกำลังทำอาหารหน้าเตา (Cooking food)',
    url: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800&auto=format&fit=crop&q=80',
    primaryKeyword: 'Cook',
    descriptionHint: 'คนกำลังปรุงอาหารในกระทะด้วยวัตถุดิบสดใหม่ในครัว',
  },
  {
    id: 'starter-work',
    name: 'คนทำงานกับคอมพิวเตอร์แล็ปท็อป (Working laptop)',
    url: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&auto=format&fit=crop&q=80',
    primaryKeyword: 'Work',
    descriptionHint: 'คนกำลังพิมพ์งานและทำงานอย่างตั้งใจหน้าคอมพิวเตอร์แล็ปท็อป',
  },
  {
    id: 'starter-walk',
    name: 'คนจูงสุนัขเดินเล่นในสวน (Walking dog in park)',
    url: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=800&auto=format&fit=crop&q=80',
    primaryKeyword: 'Walk',
    descriptionHint: 'คนกำลังเดินเล่นผ่อนคลายกับสุนัขในสวนสาธารณะที่มีต้นไม้เขียวขจี',
  },
  {
    id: 'starter-study',
    name: 'คนกำลังเรียนและจดบันทึก (Studying / Writing)',
    url: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&auto=format&fit=crop&q=80',
    primaryKeyword: 'Study',
    descriptionHint: 'นักเรียน/คนกำลังอ่านตำราและจดเลคเชอร์อย่างตั้งใจ',
  },
  {
    id: 'starter-listen',
    name: 'คนใส่หูฟังฟังเพลงอย่างมีความสุข (Listening to music)',
    url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&auto=format&fit=crop&q=80',
    primaryKeyword: 'Listen',
    descriptionHint: 'คนกำลังใส่หูฟังเพลิดเพลินกับการฟังเพลงหรือดนตรี',
  },
];

/**
 * Parser for user input words in format:
 * "Eat กิน"
 * "Sleep นอน"
 * or with separators like - : = tab comma
 */
export function parseWordList(rawText: string): WordItem[] {
  const lines = rawText.split('\n');
  const items: WordItem[] = [];
  const seen = new Set<string>();

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line || line.startsWith('#') || line.startsWith('//')) continue;

    // Check common separators: tab, dash, colon, equal sign, or whitespace
    let english = '';
    let thai = '';

    if (line.includes('\t')) {
      const parts = line.split('\t').map((p) => p.trim()).filter(Boolean);
      english = parts[0] || '';
      thai = parts.slice(1).join(' ') || '';
    } else if (line.includes(' - ')) {
      const parts = line.split(' - ').map((p) => p.trim());
      english = parts[0] || '';
      thai = parts.slice(1).join(' - ') || '';
    } else if (line.includes(':')) {
      const parts = line.split(':').map((p) => p.trim());
      english = parts[0] || '';
      thai = parts.slice(1).join(':') || '';
    } else if (line.includes('=')) {
      const parts = line.split('=').map((p) => p.trim());
      english = parts[0] || '';
      thai = parts.slice(1).join('=') || '';
    } else {
      // Split by whitespace
      const match = line.match(/^([a-zA-Z0-9'\s-]+?)[\s\t]+([\u0E00-\u0E7F].*)$/);
      if (match) {
        english = match[1].trim();
        thai = match[2].trim();
      } else {
        const parts = line.split(/\s+/);
        english = parts[0] || '';
        thai = parts.slice(1).join(' ') || '';
      }
    }

    if (english) {
      const key = english.toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        items.push({
          id: `word-${key.replace(/[^a-z0-9]/g, '_')}`,
          english: english.charAt(0).toUpperCase() + english.slice(1),
          thai: thai || english,
        });
      }
    }
  }

  return items;
}
