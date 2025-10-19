import socket as sock
import threading

grading_schema = [
    (90, "A+", 4.00),
    (86, "A", 4.00),
    (82, "A-", 3.67),
    (78, "B+", 3.33),
    (74, "B", 3.00),
    (70, "B-", 2.67),
    (66, "C+", 2.33),
    (62, "C", 2.00),
    (58, "C-", 1.67),
    (54, "D+", 1.33),
    (50, "D", 1.00),
    (0, "F", 0.00),
]

def calculate_grade(marks):
    for threshold, grade, gpa in grading_schema:
        if marks >= threshold:
            return grade, gpa
    return "F", 0.0

def handle_client(conn, addr):
    conn.sendall(b"Welcome to FAST-NUCES Karachi Campus CGPA Calculator!\n")
    student_id = conn.recv(1024).decode().strip()
    conn.sendall(b"Enter number of subjects: ")
    num_subjects = int(conn.recv(1024).decode().strip())

    total_points, total_credits = 0, 0
    results = []

    for i in range(num_subjects):
        conn.sendall(f"Subject {i+1} - Enter credit hours: ".encode())
        ch = int(conn.recv(1024).decode().strip())
        conn.sendall(f"Subject {i+1} - Enter marks (out of 100): ".encode())
        marks = int(conn.recv(1024).decode().strip())
        grade, gpa = calculate_grade(marks)
        total_points += gpa * ch
        total_credits += ch
        results.append((ch, marks, grade, gpa))

    cgpa = total_points / total_credits if total_credits > 0 else 0.0

    response = f"\nStudent ID: {student_id}\n"
    for idx, (ch, marks, grade, gpa) in enumerate(results, 1):
        response += f"Subject {idx}: Credit Hours={ch}, Marks={marks}, Grade={grade}, GPA={gpa}\n"
    response += f"Overall CGPA: {cgpa:.2f}\n"
    conn.sendall(response.encode())

    with open("cgpa_log.txt", "a") as f:
        f.write(response + "\n")

    conn.close()

def start_server():
    server = sock.socket(sock.AF_INET, sock.SOCK_STREAM)
    server.bind(("127.0.0.1", 5555))
    server.listen(5)
    print("Server running on 127.0.0.1:5555")

    while True:
        conn, addr = server.accept()
        threading.Thread(target=handle_client, args=(conn, addr)).start()

if __name__ == "__main__":
    start_server()

