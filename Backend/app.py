from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from google import genai
import sqlite3
import os
import io
import pandas as pd
from datetime import datetime
from dotenv import load_dotenv

# สำหรับสร้าง PDF
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4

load_dotenv()

app = Flask(__name__)

# --- [1. ตั้งค่าพื้นฐานสำหรับ Server จริง] ---
# อนุญาต CORS สำหรับทุกแหล่งที่มา (เพื่อให้ Netlify คุยกับ Render ได้)
CORS(app, resources={r"/api/*": {"origins": "*"}})

# กำหนด Path ของฐานข้อมูลให้เป็นแบบ Absolute เพื่อป้องกันหาไฟล์ไม่เจอใน Server
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, 'diabetes_app.db')

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE,
            password TEXT
        )
    ''')
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS user_profiles (
            username TEXT PRIMARY KEY,
            age INTEGER, weight REAL, height REAL,
            diabetes_type TEXT, medication TEXT,
            comorbidities TEXT, activity_level TEXT,
            target_low INTEGER DEFAULT 80,
            target_high INTEGER DEFAULT 130,
            FOREIGN KEY (username) REFERENCES users (username)
        )
    ''')
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS health_records (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT,
            blood_sugar INTEGER,
            carbs INTEGER,
            insulin_meal REAL,
            insulin_fix REAL,
            note TEXT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    conn.commit()
    conn.close()

# ตั้งค่า Gemini Client
api_key = os.getenv("GEMINI_API_KEY")
client = genai.Client(api_key=api_key) if api_key else None

# --- [2. API สำหรับ User & Profile] ---

@app.route('/api/register', methods=['POST'])
def register():
    data = request.json
    try:
        conn = get_db_connection()
        conn.execute("INSERT INTO users (username, password) VALUES (?, ?)", 
                     (data.get('username'), data.get('password')))
        conn.commit()
        conn.close()
        return jsonify({"message": "ลงทะเบียนสำเร็จ"}), 201
    except:
        return jsonify({"message": "ชื่อนี้มีในระบบแล้ว"}), 400

@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    conn = get_db_connection()
    user = conn.execute("SELECT * FROM users WHERE username = ? AND password = ?", 
                        (data.get('username'), data.get('password'))).fetchone()
    conn.close()
    if user:
        return jsonify({"message": "สำเร็จ", "username": data.get('username')}), 200
    return jsonify({"message": "ข้อมูลไม่ถูกต้อง"}), 401

@app.route('/api/profile/<username>', methods=['GET'])
def get_profile(username):
    conn = get_db_connection()
    profile = conn.execute("SELECT * FROM user_profiles WHERE username = ?", (username,)).fetchone()
    conn.close()
    if profile:
        return jsonify(dict(profile)), 200
    return jsonify({"message": "no_profile"}), 404

@app.route('/api/save_profile', methods=['POST'])
def save_profile():
    data = request.json
    try:
        conn = get_db_connection()
        conn.execute('''
            INSERT OR REPLACE INTO user_profiles 
            (username, age, weight, height, diabetes_type, medication, comorbidities, activity_level, target_low, target_high)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (data.get('username'), data.get('age'), data.get('weight'), data.get('height'),
              data.get('diabetes_type'), data.get('medication'), data.get('comorbidities'),
              data.get('activity_level'), data.get('target_low'), data.get('target_high')))
        conn.commit()
        conn.close()
        return jsonify({"message": "บันทึกข้อมูลเรียบร้อย"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# --- [3. API สำหรับบันทึกสุขภาพและกราฟ] ---

@app.route('/api/add_record', methods=['POST'])
def add_record():
    data = request.json
    try:
        conn = get_db_connection()
        conn.execute('''
            INSERT INTO health_records (username, blood_sugar, carbs, note)
            VALUES (?, ?, ?, ?)
        ''', (data.get('username'), data.get('blood_sugar'), data.get('carbs'), data.get('note')))
        conn.commit()
        conn.close()
        return jsonify({"message": "บันทึกสำเร็จ"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/graph/<username>/<days>', methods=['GET'])
def get_graph(username, days):
    conn = get_db_connection()
    query = "SELECT blood_sugar as value, timestamp as time FROM health_records WHERE username = ? AND timestamp >= datetime('now', ?) ORDER BY timestamp ASC"
    rows = conn.execute(query, (username, f'-{days} days')).fetchall()
    conn.close()
    
    result = []
    for r in rows:
        try:
            clean_time = r['time'].split('.')[0]
            dt = datetime.strptime(clean_time, '%Y-%m-%d %H:%M:%S')
            label = dt.strftime('%H:%M') if days == '1' else dt.strftime('%d/%m')
            result.append({"value": r['value'], "time": label})
        except: continue
    return jsonify(result)

@app.route('/api/stats/<username>', methods=['GET'])
def get_stats(username):
    conn = get_db_connection()
    rows = conn.execute("SELECT blood_sugar FROM health_records WHERE username = ?", (username,)).fetchall()
    conn.close()
    if not rows:
        return jsonify({"avg": "--", "max": "--", "min": "--"})
    values = [row['blood_sugar'] for row in rows]
    return jsonify({
        "avg": round(sum(values) / len(values)),
        "max": max(values),
        "min": min(values)
    })

# --- [4. API สำหรับส่งออกข้อมูล (Excel/PDF)] ---

@app.route('/api/export/excel', methods=['POST'])
def export_excel():
    data = request.json
    username = data.get('username')
    records = data.get('records')
    if not records: return jsonify({"error": "No data"}), 400
    df = pd.DataFrame(records)
    output = io.BytesIO()
    with pd.ExcelWriter(output, engine='openpyxl') as writer:
        df.to_excel(writer, index=False, sheet_name='Report')
    output.seek(0)
    return send_file(output, mimetype='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', as_attachment=True, download_name=f'Report_{username}.xlsx')

# --- [5. API สำหรับ Chatbot (Gemini)] ---

@app.route('/api/chat', methods=['POST'])
def chat():
    if not client:
        return jsonify({"reply": "AI ยังไม่พร้อมใช้งาน กรุณาตั้งค่า API Key"}), 200
    
    data = request.json
    username = data.get('username')
    user_text = data.get('message')
    
    conn = get_db_connection()
    profile = conn.execute("SELECT * FROM user_profiles WHERE username = ?", (username,)).fetchone()
    records = conn.execute("SELECT blood_sugar, timestamp FROM health_records WHERE username = ? ORDER BY timestamp DESC LIMIT 5", (username,)).fetchall()
    conn.close()

    p_info = f"อายุ {profile['age']}, เบาหวาน {profile['diabetes_type']}" if profile else "ไม่มีข้อมูลโปรไฟล์"
    h_info = "\n".join([f"- {r['timestamp']}: {r['blood_sugar']} mg/dL" for r in records])

    try:
        response = client.models.generate_content(
            model="gemini-3-flash-preview", 
            contents=user_text,
            config={
                "system_instruction": f"คุณคือ 'น้องดูแล' คุยกับคุณ {username} ({p_info}). น้ำตาลล่าสุด:\n{h_info}\nตอบสั้น เป็นกันเอง และให้กำลังใจ"
            }
        )
        return jsonify({"reply": response.text})
    except Exception as e:
        return jsonify({"reply": "ขออภัยค่ะ ระบบขัดข้องเล็กน้อย ลองใหม่อีกครั้งนะคะ"}), 200

# --- [6. รันเซิร์ฟเวอร์] ---
if __name__ == '__main__':
    init_db()
    # กำหนด Port จาก Environment Variable สำหรับ Render
    port = int(os.environ.get("PORT", 5000))
    app.run(host='0.0.0.0', port=port)