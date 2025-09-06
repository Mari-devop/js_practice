// Задача: Перевірка, чи є масив збільшуваним
// Умова: Напишіть функцію, яка перевіряє, чи є масив збільшуваним (кожен наступний елемент більше попереднього).

// // Приклад використання
// console.log(isIncreasing([1, 2, 3, 4])); // true
// console.log(isIncreasing([1, 2, 3, 2])); // false

// Пояснення:
// Перевіряємо кожен елемент масиву і порівнюємо його з попереднім. Якщо знайдемо спаду, повертаємо false, інакше true.

const isIncreasing = (arr) => {
  for (let i = 0; i < arr.length - 1; i++) {
    if (arr[i] >= arr[i + 1]) {
      return false;
    }
  }
  return true;
};

// console.log(isIncreasing([1, 2, 3, 4]));
// console.log(isIncreasing([1, 2, 3, 2]));
// console.log(isIncreasing([1, 2, 2, 4, 5, 6, 7, 8, 9, 10]));

// Задача: Підрахунок кількості входжень елемента в масив
// Умова: Напишіть функцію, яка приймає масив і елемент, а потім повертає кількість входжень цього елемента в масив.

// console.log(countOccurrences([1, 2, 2, 3, 4, 2], 2)); // 3

const countOccurrences = (arr, el) => {
  let count = 0;

  for (let i = 0; i < arr.length; i++) {
    if (arr[i] === el) {
      count++;
    }
  }
  return count;
};

// console.log(countOccurrences([1, 2, 2, 3, 4, 2], 2));

// Задача: Перевірка на анаграми
// Умова: Напишіть функцію, яка перевіряє, чи є два рядки анаграмами (мають однакові букви, але в різному порядку).

// // Приклад використання
// console.log(areAnagrams("listen", "silent")); // true
// console.log(areAnagrams("hello", "world")); // false

const areAnagrams = (str1, str2) => {
  if (str1.length !== str2.length) return false;

  let normalArr1 = str1.toLowerCase().split("").sort();
  let normalArr2 = str2.toLowerCase().split("").sort();

  for (let i = 0; i < normalArr1.length; i++) {
    if (normalArr1[i] != normalArr2[i]) return false;
  }
  return true;
};

// console.log(areAnagrams("hello", "world"));
// console.log(areAnagrams("listen", "silent"));

// Створити рядок з перших літер слів
// Умова:
// Напишіть функцію, яка приймає речення і повертає рядок з перших літер кожного слова.
// // Приклад
// console.log(getInitials("Front End Development")); // "FED"

const getInitials = (str) => {
  let result = "";
  str.split(" ").forEach((word) => {
    result += word[0].toUpperCase();
  });
  return result;
};

// console.log(getInitials("Front End Development"));
// console.log(getInitials("Front End Development Front End Development"));

// Задача: Підрахунок кількості літер у рядку
// Умова:
// Напишіть функцію, яка повертає об’єкт, де ключ — це літера, а значення — кількість разів, яку вона зустрічається в рядку.
// console.log(countLetters("Hello World"));
// // { h: 1, e: 1, l: 3, o: 2, w: 1, r: 1, d: 1 }

const countLetters = (str) => {
  let result = {};

  let normalizeStr = str.toLowerCase();
  let filteredStr = normalizeStr.split("").filter((letter) => letter !== " ");
  filteredStr.forEach((letter) => {
    if (result[letter]) {
      result[letter]++;
    } else {
      result[letter] = 1;
    }
  });
  return result;
};

// console.log(countLetters("Hello World"));

// Знайти перший об'єкт за умовою
// Умова:
// Напишіть функцію, яка повертає першого користувача віком більше 18.
// console.log(findAdult(users)); // { name: "Oksana", age: 22 }

const users = [
  { name: "Andrii", age: 16 },
  { name: "Vasyl", age: 20 },
  { name: "Taras", age: 18 },
  { name: "Mykola", age: 25 },
];

const findAdult = (users) => {
  let result = {};

  for (let user of users) {
    if (user.age > 18) {
      result = user;
      break;
    }
  }
  return result;
};

// console.log(findAdult(users));

// Порахувати кількість товарів у кожній категорії
// Умова:
// Напишіть функцію, яка повертає об’єкт {категорія: кількість товарів}.
// // Приклад
// console.log(countByCategory([
//   { name: "Phone", category: "tech" },
//   { name: "Laptop", category: "tech" },
//   { name: "Shirt", category: "clothes" }
// ]));
// // { tech: 2, clothes: 1 }


const countByCategory = (items) => {
    let result = {};
    for (let item of items) {
        if (result[item.category]) {
            result[item.category]++;
        } else {
            result[item.category] = 1;
        }
    }
  return result;
};

// console.log(countByCategory([
//   { name: "Phone", category: "tech" },
//   { name: "Laptop", category: "tech" },
//   { name: "Shirt", category: "clothes" }
// ]));

// Задача: Фактори числа
// Умова: Напишіть функцію, яка повертає всі фактори числа.
// Фактор (дільник) числа - це таке ціле число, яке ділить дане число без остачі.
// console.log(findFactors(12)); // [1, 2, 3, 4, 6, 12]

const findFactors = (num) => {
    let result = [];

    for (let i = 1; i <=num; i++) {
        if (num % i === 0) {
            result.push(i);
        }
    }
    return result;
};

// console.log(findFactors(12));

// Задача: Число Фібоначчі
// Умова: Напишіть функцію для обчислення числа Фібоначчі на позиції n.
// Числа Фібоначчі — це послідовність чисел, у якій кожне наступне число дорівнює сумі двох попередніх.
// формула F(n) = F(n-1) + F(n-2)

const findFibonacci = (n) => {
    let result = [0, 1];

    for (let i = 2; i <= n; i++) {
        result.push(result[i - 1] + result[i - 2]);
    }
    return result[n];
};

// console.log(findFibonacci(10));

// Задача: Пошук пари чисел, що дають суму
// Умова: Напишіть функцію, яка знаходить пару чисел в масиві, які дають задану суму.
// console.log(findPair([1, 2, 3, 4, 5], 8)); // [3, 5]

const findPair = (arr, num) => {
    let result = [];

    for (let i = 0; i <arr.length; i++) {
        for (let j = i + 1; j < arr.length; j++) {
            if (arr[i] + arr[j] === num) {
                result.push(arr[i], arr[j]);
            }
        }
    }
    return result;
};

console.log(findPair([1, 2, 3, 4, 5], 8));