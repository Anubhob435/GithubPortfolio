#!/usr/bin/env python3
"""
Command-line version of the Gemini Chat application
Simple terminal-based chat with streaming responses
"""

import os
import json
import requests
import sys
from dotenv import load_dotenv
import time

# Load environment variables
load_dotenv()

class GeminiCLIChat:
    def __init__(self):
        self.api_key = os.getenv('GEMINI_API_KEY')
        if not self.api_key:
            print("❌ Error: GEMINI_API_KEY not found in environment variables")
            print("Please check your .env file and make sure it contains your API key.")
            sys.exit(1)

        self.base_url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:streamGenerateContent"
        self.headers = {
            'x-goog-api-key': self.api_key,
            'Content-Type': 'application/json'
        }

        # Store conversation history
        self.conversation_history = []

        print("🤖 Gemini CLI Chat")
        print("=" * 50)
        print("Type 'quit', 'exit', or 'bye' to end the conversation")
        print("Type 'clear' to reset the conversation history")
        print("Type 'help' for more commands")
        print("=" * 50)

    def add_to_history(self, role: str, content: str):
        """Add message to conversation history"""
        self.conversation_history.append({
            "role": role,
            "parts": [{"text": content}]
        })

    def clear_history(self):
        """Clear conversation history"""
        self.conversation_history.clear()
        print("🧹 Conversation history cleared.")

    def format_request_body(self, user_message: str) -> dict:
        """Format the request body for Gemini API"""
        # Add user message to history
        self.add_to_history("user", user_message)

        return {
            "contents": self.conversation_history.copy()
        }

    def stream_chat_response(self, user_message: str):
        """Stream chat response and print to console"""
        try:
            # Prepare request
            url = f"{self.base_url}?alt=sse"
            body = self.format_request_body(user_message)

            print("\n🤖 Assistant: ", end="", flush=True)

            # Make streaming request
            response = requests.post(
                url,
                headers=self.headers,
                json=body,
                stream=True,
                timeout=30
            )

            response.raise_for_status()

            # Process SSE stream
            assistant_response = ""

            for line in response.iter_lines(decode_unicode=True):
                if line and line.startswith('data: '):
                    try:
                        # Parse SSE data
                        json_str = line[6:]  # Remove 'data: ' prefix

                        if json_str.strip() == '[DONE]':
                            break

                        data = json.loads(json_str)

                        # Extract text from response
                        if 'candidates' in data and len(data['candidates']) > 0:
                            candidate = data['candidates'][0]
                            if 'content' in candidate and 'parts' in candidate['content']:
                                parts = candidate['content']['parts']
                                for part in parts:
                                    if 'text' in part:
                                        text_chunk = part['text']
                                        assistant_response += text_chunk
                                        print(text_chunk, end="", flush=True)

                    except json.JSONDecodeError:
                        continue
                    except Exception as e:
                        print(f"\n❌ Error processing response: {e}")
                        continue

            print("\n")  # New line after response

            # Add assistant response to history
            if assistant_response:
                self.add_to_history("model", assistant_response)

        except requests.exceptions.RequestException as e:
            print(f"\n❌ Network error: {e}")
        except KeyboardInterrupt:
            print("\n\n👋 Conversation interrupted by user.")
            return False
        except Exception as e:
            print(f"\n❌ Unexpected error: {e}")

        return True

    def show_help(self):
        """Show available commands"""
        print("\n📋 Available commands:")
        print("  help     - Show this help message")
        print("  clear    - Clear conversation history")
        print("  history  - Show conversation history")
        print("  quit     - Exit the application")
        print("  exit     - Exit the application")
        print("  bye      - Exit the application")
        print()

    def show_history(self):
        """Show conversation history"""
        if not self.conversation_history:
            print("\n📝 No conversation history yet.")
            return

        print("\n📝 Conversation History:")
        print("-" * 30)

        for i, message in enumerate(self.conversation_history, 1):
            role = "👤 You" if message["role"] == "user" else "🤖 Assistant"
            content = message["parts"][0]["text"][:100] + "..." if len(message["parts"][0]["text"]) > 100 else message["parts"][0]["text"]
            print(f"{i}. {role}: {content}")
        print()

    def run(self):
        """Main chat loop"""
        try:
            while True:
                # Get user input
                try:
                    user_input = input("\n👤 You: ").strip()
                except KeyboardInterrupt:
                    print("\n\n👋 Goodbye!")
                    break

                if not user_input:
                    continue

                # Handle commands
                user_input_lower = user_input.lower()

                if user_input_lower in ['quit', 'exit', 'bye']:
                    print("👋 Goodbye!")
                    break
                elif user_input_lower == 'clear':
                    self.clear_history()
                    continue
                elif user_input_lower == 'help':
                    self.show_help()
                    continue
                elif user_input_lower == 'history':
                    self.show_history()
                    continue

                # Send message and get streaming response
                if not self.stream_chat_response(user_input):
                    break

        except KeyboardInterrupt:
            print("\n\n👋 Goodbye!")
        except Exception as e:
            print(f"\n❌ Fatal error: {e}")

def main():
    """Entry point for the CLI chat application"""
    try:
        chat = GeminiCLIChat()
        chat.run()
    except Exception as e:
        print(f"❌ Failed to start chat application: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
