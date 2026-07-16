# test_safe.py

def add(a, b):
    return a + b

def greet(name):
    print(f"Hello, {name}")

if __name__ == "__main__":
    result = add(5, 10)
    greet("CodeGuard")
    print(result)