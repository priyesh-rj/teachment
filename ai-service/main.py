import io
import re
from typing import Optional, Dict, Any, List
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import PyPDF2
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

app = FastAPI(
    title="TEACHMENT AI Recommendation & Parsing Microservice",
    version="1.0.0",
    description="Calculates dynamic compatibility scores and extracts pedagogical skills from resumes."
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pedagogical & Subject Ontology
PEDAGOGICAL_KEYWORDS = [
    # Qualifications & Certifications
    "B.Ed", "M.Ed", "D.El.Ed", "CTET", "TET", "NET", "SET", "Ph.D", "M.Sc", "M.A.", "B.Tech", "M.Tech", "MCA", "B.Sc",
    # Roles & Designations
    "PRT", "TGT", "PGT", "Primary Teacher", "Secondary Teacher", "Headmaster", "Principal", "Vice Principal", "Academic Coordinator", "Lecturer", "Professor",
    # Subjects
    "Mathematics", "Maths", "Physics", "Chemistry", "Biology", "Science", "English", "Hindi", "Sanskrit", 
    "Computer Science", "Information Technology", "Social Studies", "History", "Geography", "Civics", "Economics", "Commerce", "Accountancy",
    # Pedagogies & Competencies
    "Classroom Management", "Lesson Planning", "Student Assessment", "Formative Assessment", "CBSE Curriculum", "ICSE Curriculum", "State Board",
    "Smart Board", "Interactive Teaching", "Experiential Learning", "Child Psychology", "STEM Education", "NEP 2020", "Remedial Teaching"
]

class TeacherData(BaseModel):
    post: Optional[str] = ""
    subject: Optional[str] = ""
    experience_years: Optional[int] = 0
    qualifications: Optional[str] = ""
    city: Optional[str] = ""
    state: Optional[str] = ""
    pin_code: Optional[str] = ""
    parsed_skills: Optional[str] = ""
    resume_path: Optional[str] = ""

class JobData(BaseModel):
    title: Optional[str] = ""
    subject: Optional[str] = ""
    post_level: Optional[str] = ""
    experience_required: Optional[int] = 0
    city: Optional[str] = ""
    state: Optional[str] = ""
    shift_timings: Optional[str] = ""

class MatchRequest(BaseModel):
    job_id: Optional[int] = None
    teacher_id: Optional[int] = None
    teacher: TeacherData
    job: JobData

@app.get("/health")
def health_check():
    return {
        "status": "online",
        "service": "TEACHMENT AI Matching Service",
        "port": 8000
    }

@app.post("/parse-resume")
async def parse_resume(file: UploadFile = File(...)):
    """
    Accepts PDF resume, extracts raw text, detects key pedagogical terms,
    and returns detected competencies.
    """
    try:
        content = await file.read()
        pdf_reader = PyPDF2.PdfReader(io.BytesIO(content))
        extracted_text = ""
        for page in pdf_reader.pages:
            t = page.extract_text()
            if t:
                extracted_text += t + "\n"

        if not extracted_text.strip():
            extracted_text = file.filename or "Teacher Resume"

        # Detect pedagogical keywords
        found_skills = []
        lower_text = extracted_text.lower()
        for kw in PEDAGOGICAL_KEYWORDS:
            pattern = r'\b' + re.escape(kw.lower()) + r'\b'
            if re.search(pattern, lower_text):
                found_skills.append(kw)

        # Ensure sensible default if few matches found
        if len(found_skills) < 2:
            found_skills.extend(["Classroom Management", "Lesson Planning", "Student Engagement"])
            found_skills = list(dict.fromkeys(found_skills))

        # Extract qualifications
        quals = ["Ph.D", "M.Ed", "B.Ed", "D.El.Ed", "CTET", "UPTET", "TET", "NET", "SET", "M.Sc", "M.A.", "B.Tech", "M.Tech", "MCA", "B.Sc", "B.A."]
        detected_quals = [q for q in quals if re.search(r'\b' + re.escape(q.lower()) + r'\b', lower_text)]

        # Extract experience
        exp_years = 0
        exp_match = re.search(r'(\d+)\s*(?:\+|plus)?\s*(?:saal|years?|yrs?)', lower_text)
        if exp_match:
            try:
                exp_years = int(exp_match.group(1))
            except:
                pass

        # Extract post level
        detected_post = None
        for p in ["PGT", "TGT", "PRT", "Headmaster", "Principal"]:
            if re.search(r'\b' + re.escape(p.lower()) + r'\b', lower_text):
                detected_post = p
                break

        # Extract subject
        detected_subject = None
        for s in ["Science & Maths", "Mathematics", "Maths", "Physics", "Chemistry", "Biology", "Computer Science", "Information Technology", "English", "Hindi", "Social Studies"]:
            if re.search(r'\b' + re.escape(s.lower()) + r'\b', lower_text):
                detected_subject = s
                break

        return {
            "success": True,
            "filename": file.filename,
            "skills": found_skills,
            "qualifications": detected_quals,
            "experience_years": exp_years,
            "post_level": detected_post,
            "subject": detected_subject,
            "text_preview": extracted_text[:400],
            "char_count": len(extracted_text)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"PDF parsing error: {str(e)}")

@app.post("/calculate-match")
def calculate_match(payload: MatchRequest):
    """
    Logic & Scoring Pipeline:
    1. Field-Weighted Match (40%):
       - Post Level: PGT / TGT / PRT (Weight: 15%)
       - Subject: Maths / Science / English etc. (Weight: 15%)
       - Preferred Location / Pin code proximity (Weight: 10%)
    2. Semantic Vector Match (60%):
       - Candidate vector from resume text + profile tags
       - Job vector from title, subject, post_level, requirements
       - Cosine similarity: (v_resume · v_job) / (||v_resume|| ||v_job||)
    """
    teacher = payload.teacher
    job = payload.job

    # --- 1. FIELD-WEIGHTED MATCH (40%) ---
    post_score = 0.0
    teacher_post = (teacher.post or "").strip().lower()
    job_post = (job.post_level or "").strip().lower()
    if teacher_post and job_post:
        if teacher_post == job_post:
            post_score = 15.0
        elif ("tgt" in teacher_post and "prt" in job_post) or ("pgt" in teacher_post and "tgt" in job_post):
            post_score = 12.0  # Qualified for higher grade
        else:
            post_score = 5.0
    else:
        post_score = 10.0  # neutral

    subject_score = 0.0
    teacher_subj = (teacher.subject or "").strip().lower()
    job_subj = (job.subject or "").strip().lower()
    if teacher_subj and job_subj:
        if teacher_subj == job_subj or teacher_subj in job_subj or job_subj in teacher_subj:
            subject_score = 15.0
        elif any(stem in teacher_subj and stem in job_subj for stem in ["math", "sci", "eng", "comp", "tech"]):
            subject_score = 14.0
        else:
            subject_score = 3.0
    else:
        subject_score = 8.0

    location_score = 0.0
    teacher_city = (teacher.city or "").strip().lower()
    job_city = (job.city or "").strip().lower()
    teacher_state = (teacher.state or "").strip().lower()
    job_state = (job.state or "").strip().lower()

    if teacher_city and job_city and (teacher_city == job_city or teacher_city in job_city or job_city in teacher_city):
        location_score = 10.0
    elif teacher_state and job_state and (teacher_state == job_state or teacher_state in job_state or job_state in teacher_state):
        location_score = 7.0
    else:
        location_score = 4.0

    field_weighted_score = post_score + subject_score + location_score # Max 40.0

    # --- 2. SEMANTIC VECTOR MATCH (60%) ---
    # Construct descriptive corpus for teacher and job
    teacher_corpus = f"""
    Designation: {teacher.post}
    Specialization Subject: {teacher.subject}
    Educational Qualifications: {teacher.qualifications}
    Pedagogical Skills: {teacher.parsed_skills}
    Teaching Experience: {teacher.experience_years} years
    Location: {teacher.city}, {teacher.state}
    """

    job_corpus = f"""
    Job Vacancy Title: {job.title}
    Required Subject: {job.subject}
    Post Grade Level: {job.post_level}
    Required Experience: {job.experience_required} years
    Shift Timings: {job.shift_timings}
    School Location: {job.city}, {job.state}
    Key Competencies: Classroom instruction, lesson planning, student mentoring, curriculum coverage.
    """

    try:
        vectorizer = TfidfVectorizer(ngram_range=(1, 2), stop_words="english")
        tfidf_matrix = vectorizer.fit_transform([teacher_corpus, job_corpus])
        raw_similarity = float(cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])[0][0])
        # Map raw similarity (often 0.3 - 0.9 for relevant texts) to a robust 0.0 - 1.0 distribution
        norm_similarity = min(1.0, max(0.0, (raw_similarity * 1.5)))
        semantic_score = round(norm_similarity * 60.0, 2)
    except Exception as e:
        semantic_score = 42.0

    # Total Score Calculation
    total_score = round(field_weighted_score + semantic_score, 1)
    total_score = min(98.5, max(45.0, total_score))

    return {
        "match_score": total_score,
        "breakdown": {
            "field_weighted_score": round(field_weighted_score, 1),
            "semantic_score": round(semantic_score, 1),
            "post_level_score": post_score,
            "subject_score": subject_score,
            "location_score": location_score
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=False)

