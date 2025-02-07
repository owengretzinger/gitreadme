from flask import Flask, request, jsonify
from gitingest import ingest

app = Flask(__name__)

DEFAULT_EXCLUDE_PATTERNS = [
    "node_modules",
    "dist",
    "build",
    "*.log",
    "*.log.*",
]


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
    largest_files = sorted(
        [(path, len(content)) for path, content in files.items()],
        key=lambda x: x[1],
        reverse=True,
    )[:n]
    return [{"path": path, "size_kb": size / 1024} for path, size in largest_files]


@app.route("/api/pack", methods=["POST"])
def pack_repository():
    data = request.get_json()

    # Get parameters from request
    repo_url = data.get("repo_url")
    max_file_size = data.get("max_file_size", 10485760)  # Default 10MB
    max_tokens = data.get("max_tokens", 100000)  # Default 100k tokens
    additional_exclude_patterns = data.get("exclude_patterns", [])

    if not repo_url:
        return jsonify({"error": "repo_url is required"}), 400

    # Combine exclude patterns
    exclude_patterns = DEFAULT_EXCLUDE_PATTERNS + additional_exclude_patterns

    try:
        # Get repository contents
        summary, _, content = ingest(
            repo_url,
            max_file_size=max_file_size,
            exclude_patterns=exclude_patterns,
        )

        # Extract information from summary
        summary_lines = summary.split("\n")
        num_files_analyzed = int(summary_lines[1].split(": ")[1])
        estimated_tokens = (
            float(summary_lines[3].split(": ")[1].replace("k", "")) * 1000
        )

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
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(debug=True)
