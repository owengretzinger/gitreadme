from flask import Flask, request, jsonify
from functools import wraps
from dotenv import load_dotenv
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
import requests
import os
import sys
import traceback
import tiktoken

# Load environment variables
load_dotenv()

app = Flask(__name__)

# Initialize rate limiter
limiter = Limiter(
    get_remote_address,
    app=app,
    default_limits=["5 per second", "100 per minute"],
    storage_uri="memory://",
)

# Initialize tokenizer
tokenizer = tiktoken.get_encoding("cl100k_base")  # Using the same encoding as GPT-4

try:
    from gitingest import ingest
except Exception as e:
    print(f"Error importing gitingest: {str(e)}", file=sys.stderr)
    traceback.print_exc()
    sys.exit(1)

# Get token from environment variable
REPO_PACKER_TOKEN = os.getenv("REPO_PACKER_TOKEN")
if not REPO_PACKER_TOKEN:
    raise ValueError("REPO_PACKER_TOKEN environment variable is not set")


def require_token(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        auth_header = request.headers.get("Authorization")
        if not auth_header:
            return jsonify({"error": "No authorization header"}), 401

        try:
            # Extract token from "Bearer <token>"
            token_type, token = auth_header.split()
            if token_type.lower() != "bearer":
                return jsonify({"error": "Invalid authorization header format"}), 401

            if token != REPO_PACKER_TOKEN:
                return jsonify({"error": "Invalid token"}), 401

        except ValueError:
            return jsonify({"error": "Invalid authorization header format"}), 401

        return f(*args, **kwargs)

    return decorated_function


def parse_content(content):
    files = {}
    current_file = None
    current_content = []

    for line in content.split("\n"):
        if line.startswith("=" * 48):
            if current_file and current_content:
                files[current_file] = "\n".join(current_content)
            current_content = []
        elif line.startswith("File: "):
            current_file = line[6:]  # Remove 'File: ' prefix
        else:
            current_content.append(line)

    # Add the last file if there is one
    if current_file and current_content:
        files[current_file] = "\n".join(current_content)

    return files


def get_largest_files(files, n=10):
    """Get the files with the most tokens using tiktoken for accurate counting."""
    largest_files = sorted(
        [(path, len(tokenizer.encode(content))) for path, content in files.items()],
        key=lambda x: x[1],
        reverse=True,
    )[:n]
    return [{"path": path, "tokens": tokens} for path, tokens in largest_files]


def check_repo_access(repo_url):
    """Check if the repository exists and is accessible"""
    # Convert github.com URL to API URL
    if "github.com" in repo_url:
        api_url = repo_url.replace("github.com", "api.github.com/repos")
        try:
            response = requests.get(api_url)
            if response.status_code == 404:
                return False, "Repository not found", 404
            elif response.status_code == 403:
                return (
                    False,
                    "Repository is not accessible. Make sure it is public",
                    403,
                )
            elif not response.ok:
                return (
                    False,
                    f"GitHub API error: {response.status_code}",
                    response.status_code,
                )
            return True, None, 200
        except requests.RequestException as e:
            return False, f"Error checking repository: {str(e)}", 500
    return True, None, 200


def normalize_github_url(url):
    """Convert various GitHub URL formats to a consistent format."""
    if not url:
        return None

    # Remove trailing .git if present
    if url.endswith(".git"):
        url = url[:-4]

    # Remove trailing slash if present
    if url.endswith("/"):
        url = url[:-1]

    # Ensure it's a valid GitHub URL
    if not url.startswith(("https://github.com/", "http://github.com/")):
        return None

    return url


def sanitize_exclude_patterns(patterns):
    """
    Sanitize exclude patterns by:
    1. Escaping spaces with backslashes
    2. Adding **/ prefix to patterns that don't start with / or **/ to make them match at any level
    """
    if not patterns:
        return []

    sanitized = []
    for pattern in patterns:
        # Escape spaces
        pattern = pattern.replace(" ", "\\ ")
        sanitized.append(pattern)

        # Add **/ prefix if pattern doesn't start with / or **/
        if not pattern.startswith("/") and not pattern.startswith("**/"):
            sanitized.append("**/" + pattern)

    return sanitized


@app.route("/api/pack", methods=["POST"])
@require_token
def pack_repository():
    print("Packing repository...")
    data = request.get_json()

    # Get parameters from request
    repo_url = data.get("repo_url")
    max_file_size = data.get("max_file_size", 10485760)  # Default 10MB
    max_tokens = data.get("max_tokens", 100000)  # Default 100k tokens
    raw_exclude_patterns = data.get("exclude_patterns", [])
    exclude_patterns = (
        ",".join(sanitize_exclude_patterns(raw_exclude_patterns))
        if raw_exclude_patterns
        else None
    )

    if not repo_url:
        return jsonify({"error": "repo_url is required"}), 400

    # Normalize and validate GitHub URL
    normalized_url = normalize_github_url(repo_url)
    if not normalized_url:
        return (
            jsonify(
                {
                    "error": "Invalid GitHub repository URL. Please provide a valid GitHub repository URL."
                }
            ),
            400,
        )

    # Check repository access
    can_access, error_message, status_code = check_repo_access(normalized_url)
    if not can_access:
        return jsonify({"error": error_message}), status_code

    try:
        # Get repository contents
        summary, _, content = ingest(
            normalized_url,
            max_file_size=max_file_size,
            exclude_patterns=exclude_patterns,
        )

        # Extract information from summary
        summary_lines = summary.split("\n")
        num_files_analyzed = int(summary_lines[1].split(": ")[1])
        token_str = summary_lines[3].split(": ")[1]
        if token_str.endswith("M"):
            estimated_tokens = float(token_str.replace("M", "")) * 1_000_000
        else:
            estimated_tokens = float(token_str.replace("k", "")) * 1_000

        # Check if exceeds token limit
        if estimated_tokens > max_tokens:
            files = parse_content(content)
            largest_files = get_largest_files(files)

            return (
                jsonify(
                    {
                        "error": "Token limit exceeded",
                        "files_analyzed": num_files_analyzed,
                        "estimated_tokens": estimated_tokens,
                        "largest_files": largest_files,
                    }
                ),
                400,
            )

        # Return successful response with contents
        return jsonify(
            {
                "files_analyzed": num_files_analyzed,
                "estimated_tokens": estimated_tokens,
                "content": content,
            }
        )

    except Exception as e:
        error_details = {
            "error": str(e),
            "type": type(e).__name__,
            "traceback": traceback.format_exc(),
        }
        print("Error in pack_repository:", error_details, file=sys.stderr)
        return jsonify(error_details), 500


if __name__ == "__main__":
    app.run(debug=True)
