package main

import (
	"log"
	"net/http"

	"github.com/Amonteverde04/ai-code-review/backend/handlers"
	"github.com/joho/godotenv"
)

func main() {
	err := godotenv.Load("../.env")
	if err != nil {
		log.Fatal("Error loading .env file")
	}

	http.HandleFunc("/review", handlers.HandleReview)
	log.Println("Listening on :8080")
	log.Fatal(http.ListenAndServe(":8080", nil))
}
