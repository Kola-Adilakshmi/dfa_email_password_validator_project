DFA EMAIL & PASSWORD VALIDATOR — MINI PROJECT

FEATURES
- Python Flask backend
- HTML, CSS and JavaScript frontend
- Email must end exactly with @ashokacollege.in
- Password must have at least 8 characters, uppercase, lowercase, a digit and a special character
- Shows VALID/INVALID status, message and an illustrative DFA state path

IMPORTANT
This is an educational format/strength validator. It does not authenticate an actual student account and does not verify whether a password is the real password for an email account. Do not enter a real or reused password; use a sample password for your project demonstration.

RUN IN VS CODE (Windows)
1. Install Python 3.10+ and VS Code.
2. Extract this ZIP folder.
3. Open VS Code -> File -> Open Folder -> choose dfa_email_password_validator.
4. Open Terminal -> New Terminal.
5. Create a virtual environment (optional but recommended):
   py -m venv .venv
   .venv\Scripts\activate
6. Install dependency:
   py -m pip install -r requirements.txt
7. Start the app:
   py app.py
8. In the terminal, look for http://127.0.0.1:5000
9. Open that address in Chrome/Edge. Keep the terminal running while using the website.

SAMPLE TEST
Email: student@ashokacollege.in
Password: Demo@1234
Expected: Email VALID and Password VALID.

NEGATIVE TEST
Email: student@gmail.com
Password: demo
Expected: Email INVALID and Password INVALID.

PROJECT FILES
app.py                 Python Flask app and DFA-style validation
templates/index.html   Web page structure
static/style.css       Styling
static/script.js       Form submission and result display
requirements.txt       Python dependency
