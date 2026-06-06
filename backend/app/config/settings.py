from dotenv import load_dotenv
import os

load_dotenv()  
# Loads environment variables from .env file

class Settings:
    DATABASE_URL = os.getenv("DATABASE_URL")  
    # Reads DB URL from environment

settings = Settings()