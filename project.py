
def validate_email_dfa(email):
    # Fixed domain
    domain = "@ashokacollege.in"

    email = email.strip()
    transitions = []
    state_number = 0

    # Separate username and domain
    if email.count("@") != 1:
        print("\nRESULT:")
        print("Rejected: Email must contain exactly one @ symbol.")
        return

    username, entered_domain = email.split("@", 1)

    # Validate username
    if not username:
        print("\nRESULT:")
        print("Rejected: Username cannot be empty.")
        return

    # Process username character by character
    for ch in username:
        old_state = f"q{state_number}"

        if ch.isascii() and (ch.isalnum() or ch in "._-"):
            state_number += 1
            new_state = f"q{state_number}"
            transitions.append((old_state, ch, new_state))
        else:
            transitions.append((old_state, ch, "Rejected"))
            break

    username_valid = all(
        ch.isascii() and (ch.isalnum() or ch in "._-")
        for ch in username
    )

    # Process @ and domain only when username is valid
    if username_valid:
        for index, ch in enumerate("@" + entered_domain):
            old_state = f"q{state_number}"
            expected_domain = domain

            if index < len(expected_domain) and ch == expected_domain[index]:
                state_number += 1
                new_state = f"q{state_number}"
                transitions.append((old_state, ch, new_state))
            else:
                transitions.append((old_state, ch, "Rejected"))
                break

    # Display transitions
    print("\nDFA TRANSITIONS:")
    print("----------------")

    for old_state, symbol, new_state in transitions:
        print(f"{old_state} --{symbol}--> {new_state}")

    # Final validation
    result = (
        username_valid
        and entered_domain == domain[1:]
    )

    print("\nRESULT:")
    if result:
        print("Accepted: Valid email")
    else:
        print("Rejected: Invalid email")


# Main program
email = input("Enter email: ")
validate_email_dfa(email)
