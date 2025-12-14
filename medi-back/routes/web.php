<?php

use Illuminate\Support\Facades\Route;
use App\Services\OpenAIService;

// Route::get('/test-gemini', function () {
//     $gemini = new \App\Services\GeminiService();

//     $response = $gemini->chat('Bonjour, peux-tu me dire comment ça va ?');

//     return response()->json([
//         'response' => $response
//     ]);
// });


Route::get('/test-openai', function () {
    $openAI = new OpenAIService();

    $response = $openAI->chat('Bonjour, capital du cameroun?');

    return response()->json([
        'response' => $response
    ]);
});
