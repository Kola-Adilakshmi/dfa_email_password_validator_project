
from flask import Flask, render_template, request, jsonify

app = Flask(__name__)

ALLOWED_DOMAIN = "ashokacollege.in"


# EMAIL DFA
def email_dfa(email):
    email = email.strip()
    transitions = []

    if not email or email.count("@") != 1:
        return False, "Email must contain exactly one @ symbol.", transitions

    username, domain = email.split("@", 1)

    if not username:
        return False, "Enter a username before @.", transitions

    state_number = 0

    # Read each username character
    for ch in username:
        old_state = f"q{state_number}"

        if ch.isascii() and (ch.isalnum() or ch in "._-"):
            state_number += 1
            new_state = f"q{state_number}"

            transitions.append({
                "from": old_state,
                "symbol": ch,
                "to": new_state
            })
        else:
            transitions.append({
                "from": old_state,
                "symbol": ch,
                "to": "q_dead"
            })
            return False, f"Invalid username character: {ch}", transitions

    # Read @
    old_state = f"q{state_number}"
    state_number += 1

    transitions.append({
        "from": old_state,
        "symbol": "@",
        "to": f"q{state_number}"
    })

    # Read each domain character
    for i, ch in enumerate(domain):
        old_state = f"q{state_number}"

        if i < len(ALLOWED_DOMAIN) and ch == ALLOWED_DOMAIN[i]:
            state_number += 1

            transitions.append({
                "from": old_state,
                "symbol": ch,
                "to": f"q{state_number}"
            })
        else:
            transitions.append({
                "from": old_state,
                "symbol": ch,
                "to": "q_dead"
            })
            return False, (
                f"Email must end with @{ALLOWED_DOMAIN}."
            ), transitions

    if domain != ALLOWED_DOMAIN:
        return False, (
            f"Email must end with @{ALLOWED_DOMAIN}."
        ), transitions

    return True, "Valid Ashoka College email address.", transitions


# PASSWORD VALIDATION
def password_dfa(password):
    transitions = []

    if not password:
        return False, "Enter a password.", transitions

    has_upper = False
    has_lower = False
    has_digit = False
    has_special = False

    state_number = 0

    # Read each password character
    for ch in password:
        old_state = f"p{state_number}"

        if ch.isupper():
            has_upper = True
            symbol_type = "Uppercase"
        elif ch.islower():
            has_lower = True
            symbol_type = "Lowercase"
        elif ch.isdigit():
            has_digit = True
            symbol_type = "Digit"
        else:
            has_special = True
            symbol_type = "Special"

        state_number += 1

        transitions.append({
            "from": old_state,
            "symbol": ch,
            "to": f"p{state_number}",
            "type": symbol_type
        })

    # Check password requirements
    problems = []

    if len(password) < 8:
        problems.append("at least 8 characters")

    if not has_upper:
        problems.append("one uppercase letter")

    if not has_lower:
        problems.append("one lowercase letter")

    if not has_digit:
        problems.append("one digit")

    if not has_special:
        problems.append("one special character")

    if problems:
        return (
            False,
            "Password needs " + ", ".join(problems) + ".",
            transitions
        )

    return True, "Strong password.", transitions


# HOME PAGE
@app.route("/")
def index():
    return render_template("index.html")


# VALIDATION API
@app.route("/validate", methods=["POST"])
def validate():
    data = request.get_json(silent=True) or request.form

    email = str(data.get("email", ""))
    password = str(data.get("password", ""))

    email_ok, email_message, email_transitions = email_dfa(email)
    password_ok, password_message, password_transitions = password_dfa(
        password
    )

    return jsonify({
        "email": {
            "valid": email_ok,
            "message": email_message,
            "transitions": email_transitions
        },
        "password": {
            "valid": password_ok,
            "message": password_message,
            "transitions": password_transitions
        },
        "overall_valid": email_ok and password_ok
    })


# RUN APPLICATION
if __name__ == "__main__":
    app.run(debug=True)
