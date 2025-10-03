import socket as sock

def run_client():
    client = sock.socket(sock.AF_INET, sock.SOCK_STREAM)
    client.connect(("127.0.0.1", 5555))

    print(client.recv(1024).decode(), end="")

    student_id = input("Enter your Student ID: ")
    client.sendall(student_id.encode())

    print(client.recv(1024).decode(), end="")
    num_subjects = input()
    client.sendall(num_subjects.encode())

    for _ in range(int(num_subjects)):
        print(client.recv(1024).decode(), end="")
        ch = input()
        client.sendall(ch.encode())

        print(client.recv(1024).decode(), end="")
        marks = input()
        client.sendall(marks.encode())

    print("\n--- Reslt ---")
    print(client.recv(4096).decode())

    client.close()

if __name__ == "__main__":
    run_client()
