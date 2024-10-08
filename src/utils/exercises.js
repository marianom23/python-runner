export const exercises = [
  {
    "id": "1",
    "prompt": "Crea una función que verifique si la palabra radar es un palíndromo y que retorne true o false",
    "expectedOutput": "True",
    "editors": {
        "mainPy": {
          "code": "from codeToComplete import *\nprint(es_palindromo('radar'))",
          "isReadOnly": true
        },
        "codeToComplete": {
          "code": "def es_palindromo(palabra):\n    # Completa la función para ignorar mayúsculas\n    return  # Agrega la lógica aquí\n",
          "isReadOnly": false
        }
    },    
    "testCasesCode": "# Importar la función\nfrom editor1 import *\n\n# Test cases\ndef test_es_palindromo():\n    total_tests = 7\n    passed_tests = 0\n\n    if es_palindromo('radar'):\n        passed_tests += 1\n    else:\n        print(\"Error: 'radar' debería ser un palíndromo\")\n\n    if es_palindromo('reconocer'):\n        passed_tests += 1\n    else:\n        print(\"Error: 'reconocer' debería ser un palíndromo\")\n\n    if not es_palindromo('python'):\n        passed_tests += 1\n    else:\n        print(\"Error: 'python' no debería ser un palíndromo\")\n\n    if es_palindromo('Aibohphobia'):\n        passed_tests += 1\n    else:\n        print(\"Error: 'Aibohphobia' debería ser un palíndromo\")\n\n    if es_palindromo(''):\n        passed_tests += 1\n    else:\n        print(\"Error: una cadena vacía es un palíndromo\")\n\n    if es_palindromo('Ana'):\n        passed_tests += 1\n    else:\n        print(\"Error: 'Ana' debería ser un palíndromo, ignorando mayúsculas\")\n\n    if not es_palindromo('BuenosAires'):\n        passed_tests += 1\n    else:\n        print(\"Error: 'BuenosAires' no debería ser un palíndromo\")\n\n    print(f\"{passed_tests}/{total_tests} casos de prueba pasaron correctamente.\")\n\n# Ejecutar los tests\ntest_es_palindromo()",
    "solution": {
      code: "def es_palindromo(palabra):\n    palabra = palabra.lower()\n    return palabra == palabra[::-1]\n",
      isReadOnly: false
    },
  },  
  {
    id: '2',
    prompt: 'Suma 5 y 7, y muestra el resultado.',
    expectedOutput: '12',
    code: 'a = 5\nb = 7\nprint(a + b)',
  },
  {
    id: '3',
    prompt: 'Calcula el área de un círculo con radio 3 y muestra el resultado.',
    expectedOutput: '28.27',
    code: 'import math\nradio = 3\narea = math.pi * (radio ** 2)\nprint(area)',
  },
  {
    id: '4',
    prompt: 'Crea una lista de los cuadrados de los números del 1 al 5 y muéstrala.',
    expectedOutput: '[1, 4, 9, 16, 25]',
    code: 'cuadrados = [x ** 2 for x in range(1, 6)]\nprint(cuadrados)',
  },
  {
    id: '5',
    prompt: 'Cuenta el número de vocales en "Hola, ¿cómo estás?" y muéstralo.',
    expectedOutput: '7',
    code: 'texto = "Hola, ¿cómo estás?"\nvocales = "aeiouáéíóú"\ncontador = sum(1 for letra in texto.lower() if letra in vocales)\nprint(contador)',
  },
  {
    id: '6',
    prompt: 'Verifica si el número 29 es primo y muéstralo.',
    expectedOutput: 'True',
    code: 'num = 29\nes_primo = all(num % i != 0 for i in range(2, int(num ** 0.5) + 1))\nprint(es_primo)',
  },
  {
    id: '7',
    prompt: 'Genera y muestra la tabla de multiplicar del número 5.',
    expectedOutput: '[5, 10, 15, 20, 25, 30, 35, 40, 45, 50]',
    code: 'numero = 5\ntabla = [numero * i for i in range(1, 11)]\nprint(tabla)',
  },
  {
    id: '8',
    prompt: 'Calcula el factorial de 5 y muéstralo.',
    expectedOutput: '120',
    code: 'def factorial(n):\n    return 1 if n == 0 else n * factorial(n - 1)\nprint(factorial(5))',
  },
];
