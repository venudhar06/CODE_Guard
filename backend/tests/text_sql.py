# test_sql.py

import sqlite3

conn = sqlite3.connect("users.db")
cursor = conn.cursor()

user_id = input("Enter ID: ")

cursor.execute(
    f"SELECT * FROM users WHERE id = {user_id}"
)