'use client'

import { useEffect, useState } from 'react'

export default function Home() {
  const [difficulty, setDifficulty] = useState('')
  const [word, setWord] = useState('')
  const [guessedLetters, setGuessedLetters] = useState([])
  const [wrongGuesses, setWrongGuesses] = useState(0)
  const [hintUsed, setHintUsed] = useState(false)
  const [maxWrong, setMaxWrong] = useState(6)

  const fetchWords = async (count = 50) => {
    const res = await fetch(`https://random-word-api.herokuapp.com/word?number=${count}`)
    const data = await res.json()
    return data
  }

  const filterByDifficulty = (words, level) => {
    if (level === 'easy') return words.filter(w => w.length <= 4)
    if (level === 'medium') return words.filter(w => w.length >= 5 && w.length <= 6)
    return words.filter(w => w.length >= 7)
  }

  const initializeGame = async (level) => {
    setDifficulty(level)

    if (level === 'easy') setMaxWrong(10)
    else if (level === 'medium') setMaxWrong(7)
    else if (level === 'hard') setMaxWrong(4)

    const allWords = await fetchWords(100)
    const filtered = filterByDifficulty(allWords, level)
    const random = filtered[Math.floor(Math.random() * filtered.length)] || 'hangman'

    setWord(random.toLowerCase())
    setGuessedLetters([])
    setWrongGuesses(0)
    setHintUsed(false)
  }

  const handleGuess = (letter) => {
    if (guessedLetters.includes(letter)) return
    setGuessedLetters((prev) => [...prev, letter])
    if (!word.includes(letter)) {
      setWrongGuesses((prev) => prev + 1)
    }
  }

  const handleHint = () => {
    if (hintUsed || wrongGuesses >= maxWrong) return
    const remainingLetters = word.split('').filter((l) => !guessedLetters.includes(l))
    if (remainingLetters.length === 0) return
    const randomLetter = remainingLetters[Math.floor(Math.random() * remainingLetters.length)]
    handleGuess(randomLetter)
    setHintUsed(true)
  }

  const isWinner = word && word.split('').every((l) => guessedLetters.includes(l))
  const isLoser = wrongGuesses >= maxWrong

  const displayWord = word
    .split('')
    .map((letter) => (guessedLetters.includes(letter) ? letter : '_'))
    .join(' ')

  const keyboard = 'abcdefghijklmnopqrstuvwxyz'.split('').map((letter) => (
    <button
      key={letter}
      onClick={() => handleGuess(letter)}
      disabled={guessedLetters.includes(letter) || isWinner || isLoser}
      className="m-1 px-3 py-2 bg-[#111827] text-white font-bold border border-cyan-500 rounded shadow-md
                 hover:bg-cyan-600 hover:text-white hover:shadow-cyan-400/40 transition-all duration-200
                 disabled:opacity-30 disabled:cursor-not-allowed"
    >
      {letter}
    </button>
  ))

  return (
    <main className="min-h-screen flex flex-col items-center justify-center text-white p-4 font-retro
      bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-[length:200%_200%] animate-gradient-x transition-all duration-500">
      
      <h1 className="text-5xl font-extrabold mb-6 drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">
        🌴 Hangman Vice 🎮
      </h1>

      {!difficulty && (
        <div className="mb-6">
          <p className="text-lg mb-2">Select Difficulty:</p>
          {['easy', 'medium', 'hard'].map((level) => (
            <button
              key={level}
              onClick={() => initializeGame(level)}
              className="mx-2 px-4 py-2 border-2 border-white text-white rounded shadow-md hover:bg-white hover:text-black transition duration-200"
            >
              {level.charAt(0).toUpperCase() + level.slice(1)}
            </button>
          ))}
        </div>
      )}

      {difficulty && (
        <>
          <svg viewBox="0 0 200 250" className="w-40 h-64 mb-6 stroke-white">
            <style>
              {`.fade-in { opacity: 0; animation: fade 0.5s ease-out forwards; }
                @keyframes fade { to { opacity: 1; } }`}
            </style>
            <line x1="20" y1="240" x2="180" y2="240" strokeWidth="4" />
            <line x1="60" y1="240" x2="60" y2="20" strokeWidth="4" />
            <line x1="60" y1="20" x2="130" y2="20" strokeWidth="4" />
            <line x1="130" y1="20" x2="130" y2="50" strokeWidth="4" />
            {wrongGuesses > 0 && (
              <circle cx="130" cy="70" r="20" strokeWidth="4" fill="none" className="fade-in" />
            )}
            {wrongGuesses > 1 && (
              <line x1="130" y1="90" x2="130" y2="150" strokeWidth="4" className="fade-in" />
            )}
            {wrongGuesses > 2 && (
              <line x1="130" y1="110" x2="100" y2="130" strokeWidth="4" className="fade-in" />
            )}
            {wrongGuesses > 3 && (
              <line x1="130" y1="110" x2="160" y2="130" strokeWidth="4" className="fade-in" />
            )}
            {wrongGuesses > 4 && (
              <line x1="130" y1="150" x2="100" y2="190" strokeWidth="4" className="fade-in" />
            )}
            {wrongGuesses > 5 && (
              <line x1="130" y1="150" x2="160" y2="190" strokeWidth="4" className="fade-in" />
            )}
          </svg>

          <p className="text-2xl tracking-widest mb-4">{displayWord}</p>

          <button
            onClick={handleHint}
            disabled={hintUsed || isWinner || isLoser}
            className="mb-4 px-3 py-1 border border-cyan-400 text-cyan-300 rounded hover:bg-cyan-200 hover:text-black disabled:opacity-30 transition"
          >
            {hintUsed ? 'Hint Used' : 'Use Hint'}
          </button>

          <div className="flex flex-wrap justify-center max-w-xl mb-2">
            {keyboard}
          </div>

          <p className="text-md mb-6">Wrong guesses: {wrongGuesses} / {maxWrong}</p>

          {(isWinner || isLoser) && (
            <div className="mt-4 text-center space-y-2">
              <h2 className="text-2xl font-bold">
                {isWinner ? '🏆 Righteous Win!' : `💀 Game Over, dude! Word was: ${word}`}
              </h2>
              <button
                className="px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded"
                onClick={() => initializeGame(difficulty)}
              >
                Play Again
              </button>
              <button
                className="ml-2 px-4 py-2 bg-gray-200 text-black rounded"
                onClick={() => setDifficulty('')}
              >
                Change Difficulty
              </button>
            </div>
          )}
        </>
      )}
    </main>
  )
}
