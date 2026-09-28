const fs = require('fs');
const pdf = require('pdf-parse');

// Comprehensive Pedagogical & Academic Ontology
const ONTOLOGY = {
  qualifications: [
    'Ph.D', 'PhD', 'M.Phil', 'M.Tech', 'B.Tech', 'MCA', 'BCA',
    'M.Ed', 'B.Ed', 'D.El.Ed', 'D.Ed', 'BTC', 'CTET', 'UPTET', 'TET', 'NET', 'SET',
    'M.Sc', 'B.Sc', 'M.A.', 'M.A', 'B.A.', 'B.A', 'M.Com', 'B.Com', 'MBA',
    'Diploma in Elementary Education', 'Central Board of Secondary Education'
  ],
  posts: [
    { label: 'PGT', pattern: /\b(PGT|Post Graduate Teacher|Class 11-12|Senior Secondary)\b/i },
    { label: 'TGT', pattern: /\b(TGT|Trained Graduate Teacher|Class 6-10|Secondary Teacher)\b/i },
    { label: 'PRT', pattern: /\b(PRT|Primary Teacher|Primary Educator|Class 1-5)\b/i },
    { label: 'Headmaster', pattern: /\b(Headmaster|Headmistress|Principal|Vice Principal|Academic Coordinator)\b/i }
  ],
  subjects: [
    { name: 'Science & Maths', pattern: /\b(Science\s*(&|and)?\s*Maths|Maths\s*(&|and)?\s*Science)\b/i },
    { name: 'Mathematics', pattern: /\b(Mathematics|Maths|Calculus|Algebra|Geometry|Trigonometry)\b/i },
    { name: 'Physics', pattern: /\b(Physics)\b/i },
    { name: 'Chemistry', pattern: /\b(Chemistry)\b/i },
    { name: 'Biology', pattern: /\b(Biology|Botany|Zoology|Life Sciences)\b/i },
    { name: 'Science', pattern: /\b(General Science|Science)\b/i },
    { name: 'Computer Science', pattern: /\b(Computer Science|Informatics Practices|Information Technology|IT|Coding|Python|Web Development)\b/i },
    { name: 'English', pattern: /\b(English Literature|English Language|English Grammar|English)\b/i },
    { name: 'Hindi', pattern: /\b(Hindi)\b/i },
    { name: 'Sanskrit', pattern: /\b(Sanskrit)\b/i },
    { name: 'Social Studies', pattern: /\b(Social Studies|SST|History|Geography|Civics|Political Science)\b/i },
    { name: 'Commerce', pattern: /\b(Commerce|Accountancy|Business Studies|Economics)\b/i }
  ],
  skills: [
    'Classroom Management', 'Lesson Planning', 'Student Assessment', 'Formative Assessment',
    'Curriculum Planning', 'Smart Classroom', 'Interactive Teaching', 'Experiential Learning',
    'Child Psychology', 'STEM Education', 'Remedial Teaching', 'Student Evaluation',
    'Online Teaching Tools', 'Decision Making', 'Critical Thinking', 'Verbal Communication',
    'Remote Learning', 'Physics', 'Chemistry', 'Mathematics', 'Maths', 'Science',
    'Computer Science', 'Python', 'Web Development', 'CBSE Curriculum', 'ICSE Curriculum',
    'Project Planning', 'Student-centric Instruction', 'Individualized Education Plans'
  ],
  syllabi: [
    { name: 'CBSE', pattern: /\b(CBSE|Central Board of Secondary Education)\b/i },
    { name: 'ICSE', pattern: /\b(ICSE|ISC|CISCE)\b/i },
    { name: 'State Board', pattern: /\b(State Board|UP Board|Maharashtra Board)\b/i },
    { name: 'IB', pattern: /\b(IB|International Baccalaureate|Cambridge)\b/i }
  ],
  locations: [
    { city: 'Lucknow', state: 'Uttar Pradesh' },
    { city: 'Kushinagar', state: 'Uttar Pradesh' },
    { city: 'Gorakhpur', state: 'Uttar Pradesh' },
    { city: 'Kanpur', state: 'Uttar Pradesh' },
    { city: 'Varanasi', state: 'Uttar Pradesh' },
    { city: 'Noida', state: 'Uttar Pradesh' },
    { city: 'Ghaziabad', state: 'Uttar Pradesh' },
    { city: 'Mumbai', state: 'Maharashtra' },
    { city: 'Pune', state: 'Maharashtra' },
    { city: 'Delhi', state: 'Delhi' },
    { city: 'Bengaluru', state: 'Karnataka' },
    { city: 'Hyderabad', state: 'Telangana' },
    { city: 'Chennai', state: 'Tamil Nadu' },
    { city: 'Kolkata', state: 'West Bengal' },
    { city: 'Jaipur', state: 'Rajasthan' },
    { city: 'Patna', state: 'Bihar' }
  ]
};

/**
 * Robustly parses a PDF resume from disk or Buffer.
 * Extracts text and derives candidate qualifications, experience, skills, etc.
 */
async function parseResumeFile(filePathOrBuffer, originalName = '') {
  let text = '';

  try {
    const buffer = Buffer.isBuffer(filePathOrBuffer)
      ? filePathOrBuffer
      : fs.readFileSync(filePathOrBuffer);

    const pdfData = await pdf(buffer);
    text = pdfData.text || '';
  } catch (err) {
    console.warn('⚠️ pdf-parse warning / fallback:', err.message);
  }

  // If text extraction was empty or failed, use filename clues
  const parsingSource = (text && text.trim().length > 20)
    ? text
    : (originalName || 'Educator Resume');

  return extractDetailsFromText(parsingSource, originalName);
}

/**
 * Extracts structured teacher profile fields from raw text.
 */
function extractDetailsFromText(text, originalName = '') {
  const result = {
    name: null,
    phone: null,
    email: null,
    skills: [],
    qualifications: [],
    experience_years: 0,
    post: null,
    subject: null,
    syllabus: null,
    city: null,
    state: null
  };

  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);

  // 1. Detect Candidate Name (First clean line or from header)
  for (const line of lines.slice(0, 5)) {
    if (
      line.length > 3 &&
      line.length < 50 &&
      !line.includes('@') &&
      !line.includes('http') &&
      !/resume|curriculum|vitae|page|profile/i.test(line) &&
      /^[A-Za-z\s.]+$/.test(line)
    ) {
      result.name = line.trim();
      break;
    }
  }

  // 2. Email & Phone
  const emailMatch = text.match(/[\w.-]+@[\w.-]+\.[A-Za-z]{2,}/);
  if (emailMatch) {
    result.email = emailMatch[0].toLowerCase();
  }

  const phoneMatch = text.match(/(?:\+91[\s-]?)?[6789]\d{9}/);
  if (phoneMatch) {
    result.phone = phoneMatch[0].replace(/\s+/g, '');
  }

  // 3. Qualifications
  const foundQuals = [];
  for (const q of ONTOLOGY.qualifications) {
    const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`\\b${escaped}\\b`, 'i');
    if (regex.test(text) && !foundQuals.includes(q)) {
      foundQuals.push(q);
    }
  }
  if (foundQuals.length > 0) {
    result.qualifications = foundQuals;
  }

  // 4. Experience Years
  // Matches "7 saal", "7 years", "7+ years", "7 yrs", "experience: 7", etc.
  const expPatterns = [
    /(\d+)\s*(?:\+|plus)?\s*(?:saal|years?|yrs?)/i,
    /(?:experience|anubhav)[:\s]+(\d+)/i,
    /(\d+)\s*(?:saal|years?|yrs?)\s*(?:se\s*zyada|ka\s*anubhav|of\s*experience)/i
  ];
  for (const pattern of expPatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      const parsed = parseInt(match[1], 10);
      if (parsed > 0 && parsed < 50) {
        result.experience_years = parsed;
        break;
      }
    }
  }

  // 5. Post Level
  for (const p of ONTOLOGY.posts) {
    if (p.pattern.test(text)) {
      result.post = p.label;
      break;
    }
  }

  // 6. Subject
  for (const s of ONTOLOGY.subjects) {
    if (s.pattern.test(text)) {
      result.subject = s.name;
      break;
    }
  }

  // 7. Syllabus
  for (const syl of ONTOLOGY.syllabi) {
    if (syl.pattern.test(text)) {
      result.syllabus = syl.name;
      break;
    }
  }

  // 8. Location
  for (const loc of ONTOLOGY.locations) {
    const cityPattern = new RegExp(`\\b${loc.city}\\b`, 'i');
    const statePattern = new RegExp(`\\b${loc.state}\\b`, 'i');
    if (cityPattern.test(text)) {
      result.city = loc.city;
      result.state = loc.state;
      break;
    } else if (statePattern.test(text) && !result.state) {
      result.state = loc.state;
    }
  }

  // 9. Pedagogical & Technical Skills
  const foundSkills = [];
  for (const skill of ONTOLOGY.skills) {
    const escaped = skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`\\b${escaped}\\b`, 'i');
    if (regex.test(text) && !foundSkills.includes(skill)) {
      foundSkills.push(skill);
    }
  }

  // If qualifications or subjects found, add relevant pedagogical skills
  if (result.subject && !foundSkills.includes(result.subject)) {
    foundSkills.unshift(result.subject);
  }
  if (result.post && !foundSkills.includes(result.post)) {
    foundSkills.unshift(result.post);
  }

  // Guarantee minimum 4 high-quality skills
  if (foundSkills.length < 3) {
    foundSkills.push('Classroom Management', 'Lesson Planning', 'Student Engagement', 'Subject Pedagogy');
  }

  result.skills = Array.from(new Set(foundSkills));

  return result;
}

module.exports = {
  parseResumeFile,
  extractDetailsFromText,
  ONTOLOGY
};
