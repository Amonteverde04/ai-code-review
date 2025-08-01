package internal

import (
	"context"
	"os"

	"github.com/tmc/langchaingo/llms"
	"github.com/tmc/langchaingo/llms/googleai"
	"github.com/tmc/langchaingo/prompts"
)

type CodeReviewer struct {
	llm      llms.Model
	template *prompts.PromptTemplate
}

func NewCodeReviewer(code string, filename string, language string) (*CodeReviewer, error) {
	llm, err := googleai.New(
		context.Background(),
		googleai.WithDefaultModel("gemini-2.0-flash"),
		googleai.WithAPIKey(os.Getenv("GEMINI_API_KEY")),
	)
	if err != nil {
		return nil, err
	}

	template := prompts.NewPromptTemplate(
		`You are a senior software engineer that reviews code and provides feedback. You are given a code snippet and you need to review it and provide feedback. Analyze the code for:
		
		1. **Bugs and Logic Issues**: Potential runtime errors, nil pointer dereferences, race conditions
		2. **Performance**: Inefficient algorithms, unnecessary allocations, string concatenation issues
		3. **Style**: Go idioms, naming conventions, error handling patterns
		4. **Security**: Input validation, sensitive data handling
		5. **Best Practices**: Use of best practices, code organization, modularity
		6. **Code Readability**: Code readability, maintainability, and readability
		7. **Code Complexity**: Code complexity, readability, and maintainability
		8. **Code Performance**: Code performance, readability, and maintainability
		9. **Code Security**: Code security, readability, and maintainability
		10. **Code Best Practices**: Code best practices, readability, and maintainability

		Code to review:
		'''
		{{.code}}
		'''

		File: {{.filename}}
		Most likely language: {{.language}}

		Provide a detailed analysis that is actionable and helpful for the developer to improve the code. For each issue:
		- Explain WHY it is an issue
		- Explain HOW to fix it with code examples
		- Explain the best practice for the issue
		- Rate the severity of the issue: Critical, Warning, Suggestion
		
		focus on the most critical issues first. DO NOT GO OVER 5000 CHARACTERS.`, []string{"code", "filename"})

	return &CodeReviewer{
		llm:      llm,
		template: &template,
	}, nil
}

func (cr *CodeReviewer) ReviewCode(code string, filename string, language string) (string, error) {
	prompt, err := cr.template.Format(map[string]any{
		"code":     code,
		"filename": filename,
		"language": language,
	})
	if err != nil {
		return "", err
	}

	ctx := context.Background()
	response, err := cr.llm.GenerateContent(ctx, []llms.MessageContent{
		llms.TextParts(llms.ChatMessageTypeHuman, prompt),
	})
	if err != nil {
		return "", err
	}

	return response.Choices[0].Content, nil
}
