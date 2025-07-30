package pkg

type RequestBody struct {
	Language   string `json:"language"`
	EditorCode string `json:"editorCode,omitempty"`
}
