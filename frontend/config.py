import os

# OpenAI API Configuration
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY', 'your-api-key-here')

# Security Settings
ALLOWED_HOSTS = ['localhost', '127.0.0.1']
MAX_SCAN_TARGETS = 5
SCAN_TIMEOUT = 300

# Logging
LOG_LEVEL = 'INFO'
LOG_FILE = 'pentest.log'
