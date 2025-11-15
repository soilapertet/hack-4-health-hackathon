import google.generativeai as genai
from dotenv import load_dotenv
import os

load_dotenv()

genai.configure(api_key = os.getenv("API_KEY"))

def gemini(prompt):
    try:
        model = genai.GenerativeModel("gemini-2.5-flash-lite")
        response = model.generate_content(f"prompt starts =  {prompt}   = prompt ends   side note: MAKE IT SHORT just like one paragraph its a chat.")
        return response.text

    except Exception as e:
        print(f"Error using Gemini API: {e}")
        return None


