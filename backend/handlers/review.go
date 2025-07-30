package handlers

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"

	"github.com/Amonteverde04/ai-code-review/backend/internal"
	"github.com/Amonteverde04/ai-code-review/backend/pkg"
)

func HandleReview(w http.ResponseWriter, r *http.Request) {
	// Set CORS headers for frontend integration
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
	w.Header().Set("Content-Type", "application/json")

	// Handle preflight requests
	if r.Method == "OPTIONS" {
		w.WriteHeader(http.StatusOK)
		return
	}

	if r.Method != "POST" {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var response pkg.ReviewResponse

	// Check content type to determine how to process the request
	contentType := r.Header.Get("Content-Type")

	if strings.Contains(contentType, "multipart/form-data") {
		response = handleReviewRequest(r)
	} else {
		response = pkg.ReviewResponse{
			Success: false,
			Error:   "Unsupported content type. Use application/json for editor content or multipart/form-data for file uploads",
		}
	}

	// Send response
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(response)
}

func handleEditorRequest(r *http.Request) pkg.ReviewResponse {
	payloadStr := r.FormValue("payload")

	var requestBody pkg.RequestBody
	if payloadStr != "" {
		err := json.Unmarshal([]byte(payloadStr), &requestBody)
		if err != nil {
			fmt.Println("Failed to parse JSON payload: ", err)
		}
	} else {
		// Fallback: use individual fields if no JSON payload was given
		requestBody = pkg.RequestBody{
			Language:   r.FormValue("language"),
			EditorCode: r.FormValue("editorCode"),
		}
	}

	if requestBody.EditorCode == "" {
		return pkg.ReviewResponse{
			Success: false,
			Error:   "Editor code is empty",
		}
	}

	filename := "online-editor"
	review, err := process_code(requestBody.EditorCode, filename, requestBody.Language)
	if err != nil {
		return pkg.ReviewResponse{
			Success: false,
			Error:   "AI review failed: " + err.Error(),
		}
	}

	return pkg.ReviewResponse{
		Success:    true,
		Message:    fmt.Sprintf("Successfully uploaded and processed %d files for review", 1),
		AIResponse: map[string]string{filename: review},
	}
}

func handleReviewRequest(r *http.Request) pkg.ReviewResponse {
	// Parse multipart form (max 32MB)
	if err := r.ParseMultipartForm(32 << 20); err != nil {
		return pkg.ReviewResponse{
			Success: false,
			Error:   "Failed to parse form data: " + err.Error(),
		}
	}

	formHasNoFiles := len(r.MultipartForm.File) == 0
	formHasNoPayload := r.FormValue("payload") == ""

	if formHasNoFiles && formHasNoPayload {
		return pkg.ReviewResponse{
			Success: false,
			Error:   "No files were uploaded",
		}
	}

	payloadStr := r.FormValue("payload")

	if formHasNoFiles {
		return handleEditorRequest(r)
	}

	var requestBody pkg.RequestBody
	if payloadStr != "" {
		err := json.Unmarshal([]byte(payloadStr), &requestBody)
		if err != nil {
			fmt.Println("Failed to parse JSON payload: ", err)
		}
	} else {
		// Fallback: use individual fields if no JSON payload was given
		requestBody = pkg.RequestBody{
			Language: "language",
		}
	}

	ai_responses := make(map[string]string)

	// Process uploaded files
	for _, fileHeaders := range r.MultipartForm.File {
		for _, fileHeader := range fileHeaders {
			file, err := fileHeader.Open()
			if err != nil {
				continue
			}

			content, err := io.ReadAll(file)
			file.Close()
			if err != nil {
				continue
			}

			filename := fileHeader.Filename
			processed_code, err := process_code(string(content), filename, requestBody.Language)
			if err != nil {
				fmt.Println("AI review failed. Skipping file: ", filename)
				continue
			}

			ai_responses[filename] = processed_code
		}
	}

	if len(ai_responses) == 0 {
		return pkg.ReviewResponse{
			Success: false,
			Error:   "No files were reviewed successfully",
		}
	}

	return pkg.ReviewResponse{
		Success:    true,
		Message:    fmt.Sprintf("Successfully uploaded and processed %d files for review", len(ai_responses)),
		AIResponse: ai_responses,
	}
}

func process_code(unprocessed_code string, filename string, language string) (string, error) {
	reviewer, err := internal.NewCodeReviewer(unprocessed_code, filename, language)
	if err != nil {
		return "", err
	}

	review, err := reviewer.ReviewCode(unprocessed_code, filename, language)
	if err != nil {
		return "", err
	}

	return review, nil
}
