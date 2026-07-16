# test_vuln.py

import os
import pickle
import yaml
import subprocess

name = input("Enter your name: ")

# Dangerous
eval(name)

# Dangerous
exec("print('Hello')")

# Dangerous
os.system("dir")

# Dangerous
subprocess.call(["dir"])

# Dangerous
subprocess.run(["dir"])

# Dangerous
subprocess.Popen(["dir"])

# Dangerous
pickle.loads(b"data")

# Dangerous
yaml.load("a: 1", Loader=yaml.Loader)