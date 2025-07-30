1. Test with multipart/form-data (file upload + plain language field)
curl -X POST "http://localhost:8080/review" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@test.py" \
  -F "language=python"

2. Test with multipart/form-data (file upload + payload field)
curl -X POST "http://localhost:8080/review" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@test.py" \
  -F "payload={\"editorCode\":\"print(\\\"Hello, World!\\\")\",\"language\":\"python\"};type=application/json"

3. No files
curl -X POST "http://localhost:8080/review" \
  -H "Content-Type: multipart/form-data" \
  -F "payload={\"editorCode\":\"print(\\\"Hello, World!\\\")\",\"language\":\"python\"};type=application/json"

4. No language
  curl -X POST "http://localhost:8080/review" \
  -H "Content-Type: multipart/form-data" \
  -F "payload={\"editorCode\":\"print(\\\"Hello, World!\\\")\"};type=application/json"