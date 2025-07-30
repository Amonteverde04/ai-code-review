package pkg

type ReviewResponse struct {
	Success    bool              `json:"success"`
	Message    string            `json:"message,omitempty"`
	AIResponse map[string]string `json:"ai_response,omitempty"`
	Error      string            `json:"error,omitempty"`
}
